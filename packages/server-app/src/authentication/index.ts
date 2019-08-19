import { WithinConnection } from '../lib/db'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import sql from 'sql-template-tag'

const SALT_ROUNDS = 10
export const hashPassword = async (password: string) =>
  bcrypt.hash(password, SALT_ROUNDS)

export const comparePassword = async (password: string, passwordHash: string) =>
  bcrypt.compare(password, passwordHash)

type ValidatePassword = (
  deps: { withinConnection: WithinConnection },
  params: { userIdentifier: string, password: string}
) => Promise<boolean>

export const validatePassword: ValidatePassword = async (dependencies, params) => {
  return dependencies.withinConnection(async ({ client }) => {
    const result = await client.query(sql`
      SELECT * FROM user_authentication
      WHERE user_identifier = ${params.userIdentifier}
    `)

    for (let user of result.rows) {
      if (await comparePassword(params.password, user.password)) {
        return true
      }
    }
    return false
  })
}

type Register = (
  deps: { withinConnection: WithinConnection },
  params: { userIdentifier: string, password: string}
) => Promise<void>

export const register: Register = async (dependencies, params) => {
  const passwordHash = await hashPassword(params.password)
  return dependencies.withinConnection(async ({ client }) => {
    await client.query(sql`
      INSERT into user_authentication (user_identifier, password)
      VALUES (${params.userIdentifier}, ${passwordHash})
    `)
  })
}

type RequestPasswordReset = (
  deps: { withinConnection: WithinConnection },
  params: { userIdentifier: string}
) => Promise<{ userIdentifier: string, token: string }>

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

    return { userIdentifier: params.userIdentifier, token }
  })
}

type ResetPasswordByToken = (
  deps: { withinConnection: WithinConnection },
  params: { userIdentifier: string, token: string, newPassword: string }
) => Promise<boolean>

export const resetPasswordByToken: ResetPasswordByToken = async (dependencies, params) => {
  return dependencies.withinConnection(async ({ client }) => {
    const records = await client.query(sql`
      SELECT * FROM user_authentication
      WHERE user_identifier=${params.userIdentifier}
    `)

    const record = records.rows[0]
    if (!record && await comparePassword(params.token, record.passwordResetToken)) {
      return false
    }

    const hashedPassword = await hashPassword(params.newPassword)
    await client.query(sql`
      UPDATE user_authentication
      SET password=${hashedPassword},
          password_reset_token=null,
          password_reset_sent_at=null
      WHERE id=${record.id}
    `)

    return true
  })
}
