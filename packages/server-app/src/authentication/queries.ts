import bcrypt from 'bcrypt'
import sql from 'sql-template-tag'
import { DBClient } from '../lib/db'
import { AuthenticationToken, UserAuthentication } from '../domain'

export const hashPassword = async (password: string) =>
  bcrypt.hash(password, 10)

export const comparePassword = async (password: string, passwordHash: string) =>
  bcrypt.compare(password, passwordHash)

type FindUserById = (
  deps: { client: DBClient },
  params: { id: string }
) => Promise<any>

export const findUserById: FindUserById = async (dependencies, params) => {
  const records = await dependencies.client.query(sql`
      SELECT * FROM user_authentication
      WHERE id=${params.id}
      LIMIT 1
  `)
  return records.rows[0]
}

type FindUserByIdentifier = (
  deps: { client: DBClient },
  params: { userIdentifier: string }
) => Promise<any>

export const findUserByIdentifier: FindUserByIdentifier = async (dependencies, params) => {
  const records = await dependencies.client.query(sql`
      SELECT * FROM user_authentication
      WHERE user_identifier=${params.userIdentifier}
      LIMIT 1
  `)
  return records.rows[0]
}

type FindUserByAuthentication = (
  deps: { client: DBClient },
  params: { userIdentifier: string, password: string}
) => Promise<UserAuthentication>

export const findUserByAuthentication: FindUserByAuthentication = async ({ client }, params) => {
  const user = await findUserByIdentifier({ client }, params)
  return user && (await comparePassword(params.password, user.password))
    ? user
    : undefined
}

type FindUserByAuthenticationToken = (
  deps: { client: DBClient },
  token: AuthenticationToken
) => Promise<any>

export const findUserByAuthenticationToken: FindUserByAuthenticationToken = async ({ client }, token) => {
  const records = await client.query(sql`
      SELECT * FROM user_authentication
      WHERE id=${token.id}
      AND (password_changed_at is null OR password_changed_at <= ${token.createdAt})
      LIMIT 1
  `)

  return records.rows[0]
}
