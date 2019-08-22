import { WithinConnection, DBClient } from '../lib/db'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import sql from 'sql-template-tag'
import { LocalDateTime, nativeJs } from 'js-joda'

type Result<Body> = {
  body: Body,
  isSuccess: boolean
}
const success = <T>(body: T): Result<T> =>
  ({ isSuccess: true, body })

const failure = <T>(body: T): Result<T> =>
  ({ isSuccess: true, body })


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
    return user && await comparePassword(params.password, user.password)
  })
}

type RegisterErrors =
| 'User Identifier already taken'

type Register = (
  deps: { withinConnection: WithinConnection },
  params: { userIdentifier: string, password: string}
) => Promise<Result<void | RegisterErrors>>

export const register: Register = async (dependencies, params) => {
  const passwordHash = await hashPassword(params.password)
  return dependencies.withinConnection(async ({ client }) => {
    try {
      await client.query(sql`
        INSERT into user_authentication (user_identifier, password)
        VALUES (${params.userIdentifier}, ${passwordHash})
      `)
      return success(void 0)
    } catch (e) {
      if (e.code === '23505') {
        return failure<RegisterErrors>('User Identifier already taken')
      }
      throw e;
    }
  })
}

type RequestPasswordReset = (
  deps: { withinConnection: WithinConnection },
  params: { userIdentifier: string}
) => Promise<Result<{ userIdentifier: string, token: string }>>

export const requestPasswordReset: RequestPasswordReset = async (dependencies, params) => {
  const token = await crypto.randomBytes(50).toString('hex')
  const hashedToken = await hashPassword(token)

  return dependencies.withinConnection(async ({ client }) => {
    await client.query(sql`
      UPDATE user_authentication
      SET password_reset_token=(${hashedToken}),
          password_reset_sent_at=${new Date()}
      WHERE user_identifier=${params.userIdentifier}
    `)

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
