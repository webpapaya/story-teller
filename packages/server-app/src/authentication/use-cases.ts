import bcrypt from 'bcrypt'
import crypto from 'crypto'
import sql from 'sql-template-tag'
import { Result as SResult, Err, Ok } from 'space-lift'
import { LocalDateTime, nativeJs } from 'js-joda'
import { SendMail } from './emails'
import { UserAuthentication } from '../domain'
import { findUserByIdentifier } from './queries'
import { RepositoryError } from '../errors'
import { PoolClient } from 'pg'
import { ExternalDependencies } from '../lib/use-case'

type TokenErrors =
| 'TOKEN_NOT_FOUND'
| 'TOKEN_IS_TO_OLD'
| 'TOKEN_EXPIRED'
| 'TOKEN_INVALID'

const SALT_ROUNDS = process.env.NODE_ENV === 'test' ? 1 : 10

export const hashPassword = async (password: string) =>
  bcrypt.hash(password, SALT_ROUNDS)

export const comparePassword = async (password: string, passwordHash: any) =>
  passwordHash && bcrypt.compare(password, passwordHash)

type RegisterErrors =
| 'User Identifier already taken'

type Register = (
  deps: ExternalDependencies & { sendMail: SendMail },
  params: { userIdentifier: string, password: string}
) => Promise<SResult<RegisterErrors, undefined>>

export const register: Register = async (clients, params) => {
  const passwordHash = await hashPassword(params.password)
  const confirmationToken = await crypto.randomBytes(50).toString('hex')
  const hashedConfirmationToken = await hashPassword(confirmationToken)

  try {
    await clients.pgClient.query(sql`
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

    await clients.sendMail({
      type: 'RegisterEmail',
      to: params.userIdentifier,
      language: 'en',
      payload: { token: confirmationToken }
    })

    return Ok(void 0)
  } catch (e) {
    if (e.code === '23505') {
      return Err('User Identifier already taken' as const)
    }
    throw e
  }
}

type Confirm = (
  deps: ExternalDependencies,
  params: { userIdentifier: string, token: string }
) => Promise<SResult<RepositoryError, UserAuthentication>>

export const confirm: Confirm = async (dependencies, params) => {
  const result = await findUserByIdentifier(dependencies, params)
  if (!result.isOk()) { return result }
  const record = result.get()

  if (!(await comparePassword(params.token, record.confirmationToken))) {
    return Err('NOT_FOUND' as const)
  }

  await dependencies.pgClient.query(sql`
      UPDATE user_authentication
      SET confirmation_token=null,
          confirmed_at=${new Date()}
      WHERE user_identifier=${params.userIdentifier}
    `)

  return result
}

type RequestPasswordReset = (
  deps: ExternalDependencies & { sendMail: SendMail },
  params: { userIdentifier: string}
) => Promise<SResult<never, { userIdentifier: string, token: string }>>

export const requestPasswordReset: RequestPasswordReset = async (dependencies, params) => {
  const token = await crypto.randomBytes(20).toString('hex')
  const hashedToken = await hashPassword(token)

  const result = await dependencies.pgClient.query(sql`
      UPDATE user_authentication
      SET password_reset_token=(${hashedToken}),
          password_reset_created_at=${new Date()}
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

  return Ok({ userIdentifier: params.userIdentifier, token })
}

type ResetPasswordByToken = (
  deps: ExternalDependencies,
  params: { userIdentifier: string, token: string, password: string }
) => Promise<SResult<TokenErrors, undefined>>

export const resetPasswordByToken: ResetPasswordByToken = async (dependencies, params) => {
  const result = await findUserByIdentifier(dependencies, params)
  if (!result.isOk()) { return Err('TOKEN_NOT_FOUND' as const) }
  const record = result.get()

  if (!await comparePassword(params.token, record.passwordResetToken)) {
    return Err('TOKEN_INVALID' as const)
  }

  const isTokenToOld = record.passwordResetCreatedAt && LocalDateTime.from(nativeJs(new Date()))
    .minusDays(1)
    .plusSeconds(1)
    .isAfter(record.passwordResetCreatedAt)

  if (isTokenToOld) {
    await dependencies.pgClient.query(sql`
        UPDATE user_authentication
        SET password_reset_token=null,
            password_reset_created_at=null
        WHERE id=${record.id}
      `)
    return Err('TOKEN_EXPIRED' as const)
  }

  const hashedPassword = await hashPassword(params.password)
  await dependencies.pgClient.query(sql`
      UPDATE user_authentication
      SET password=${hashedPassword},
          password_reset_token=null,
          password_reset_created_at=null,
          password_changed_at=${new Date()}
      WHERE id=${record.id}
    `)

  return Ok(void 0)
}
