import { WithinConnection, DBClient } from '../lib/db'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import sql from 'sql-template-tag'
import { LocalDateTime, nativeJs } from 'js-joda'
import { SendMail } from './emails'

type Result<Body> = {
  body: Body
  isSuccess: boolean
}
const success = <T>(body: T): Result<T> =>
  ({ isSuccess: true, body })

const failure = <T>(body: T): Result<T> =>
  ({ isSuccess: false, body })

const SALT_ROUNDS = process.env.NODE_ENV === 'test' ? 1 : 10

export const hashPassword = async (password: string) =>
  bcrypt.hash(password, SALT_ROUNDS)

export const comparePassword = async (password: string, passwordHash: string) =>
  bcrypt.compare(password, passwordHash)

type FindUserByIdentifier = (
  deps: { client: DBClient },
  params: { userIdentifier: string }
) => Promise<any>

const findUserByIdentifier: FindUserByIdentifier = async (dependencies, params) => {
  const records = await dependencies.client.query(sql`
      SELECT * FROM user_authentication
      WHERE user_identifier=${params.userIdentifier}
      LIMIT 1
  `)
  return records.rows[0]
}

type ValidatePassword = (
  deps: { withinConnection: WithinConnection },
  params: { userIdentifier: string, password: string}
) => Promise<boolean>

export const validatePassword: ValidatePassword = async (dependencies, params) => {
  return dependencies.withinConnection(async ({ client }) => {
    const user = await findUserByIdentifier({ client }, params)
    // eslint-disable-next-line no-return-await
    return user && (await comparePassword(params.password, user.password))
  })
}

type RegisterErrors =
| 'User Identifier already taken'

type Register = (
  deps: { withinConnection: WithinConnection, sendMail: SendMail },
  params: { userIdentifier: string, password: string}
) => Promise<Result<void | RegisterErrors>>

export const register: Register = async (dependencies, params) => {
  const passwordHash = await hashPassword(params.password)
  const confirmationToken = await crypto.randomBytes(50).toString('hex')
  const hashedConfirmationToken = await hashPassword(confirmationToken)

  return dependencies.withinConnection(async ({ client }) => {
    try {
      await client.query(sql`
        INSERT into user_authentication (
          user_identifier,
          password,
          created_at,
          confirmation_token
        )
        VALUES (
          ${params.userIdentifier},
          ${passwordHash},
          ${new Date()},
          ${hashedConfirmationToken}
        )
      `)

      await dependencies.sendMail({
        type: 'RegisterEmail',
        to: params.userIdentifier,
        language: 'en',
        payload: { token: confirmationToken }
      })

      return success(void 0)
    } catch (e) {
      if (e.code === '23505') {
        return failure<RegisterErrors>('User Identifier already taken')
      }
      throw e
    }
  })
}

type ConfirmErrors =
| 'Token not found'

type Confirm = (
  deps: { withinConnection: WithinConnection },
  params: { userIdentifier: string, token: string }
) => Promise<Result<void | ConfirmErrors>>

export const confirm: Confirm = async (dependencies, params) => {
  return dependencies.withinConnection(async ({ client }) => {
    const record = await findUserByIdentifier({ client }, params)
    if (!record || !await comparePassword(params.token, record.confirmationToken)) {
      return failure<ConfirmErrors>('Token not found')
    }

    await client.query(sql`
      UPDATE user_authentication
      SET confirmation_token=null,
          confirmed_at=${new Date()}
      WHERE user_identifier=${params.userIdentifier}
      RETURNING *
    `)
    return success(void 0)
  })
}

type RequestPasswordReset = (
  deps: { withinConnection: WithinConnection, sendMail: SendMail },
  params: { userIdentifier: string}
) => Promise<Result<{ userIdentifier: string, token: string }>>

export const requestPasswordReset: RequestPasswordReset = async (dependencies, params) => {
  const token = await crypto.randomBytes(50).toString('hex')
  const hashedToken = await hashPassword(token)

  return dependencies.withinConnection(async ({ client }) => {
    const result = await client.query(sql`
      UPDATE user_authentication
      SET password_reset_token=(${hashedToken}),
          password_reset_sent_at=${new Date()}
      WHERE user_identifier=${params.userIdentifier}
      RETURNING *
    `)
    const record = result.rows[0]
    if (record) {
      await dependencies.sendMail({
        type: 'PasswordResetRequestEmail',
        to: record.userIdentifier,
        language: 'de',
        payload: { token }
      })
    }

    return success({ userIdentifier: params.userIdentifier, token })
  })
}

type ResetPasswordErrors =
| 'Token too old'
| 'Token not found'

type ResetPasswordByToken = (
  deps: { withinConnection: WithinConnection },
  params: { userIdentifier: string, token: string, newPassword: string }
) => Promise<Result<void | ResetPasswordErrors>>

export const resetPasswordByToken: ResetPasswordByToken = async (dependencies, params) => {
  return dependencies.withinConnection(async ({ client }) => {
    const record = await findUserByIdentifier({ client }, params)
    if (!record || !await comparePassword(params.token, record.passwordResetToken)) {
      return failure<ResetPasswordErrors>('Token not found')
    }

    const isTokenToOld = LocalDateTime.from(nativeJs(new Date()))
      .minusDays(1)
      .plusSeconds(1)
      .isAfter(record.passwordResetSentAt)

    if (isTokenToOld) {
      await client.query(sql`
        UPDATE user_authentication
        SET password_reset_token=null,
            password_reset_sent_at=null
        WHERE id=${record.id}
      `)
      return failure<ResetPasswordErrors>('Token not found')
    }

    const hashedPassword = await hashPassword(params.newPassword)
    await client.query(sql`
      UPDATE user_authentication
      SET password=${hashedPassword},
          password_reset_token=null,
          password_reset_sent_at=null
      WHERE id=${record.id}
    `)

    return success(void 0)
  })
}
