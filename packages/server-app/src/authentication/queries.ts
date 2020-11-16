import bcrypt from 'bcrypt'
import { Result, Ok, Err } from 'space-lift'
import sql from 'sql-template-tag'
import { DBClient } from '../lib/db'
import { AuthenticationToken, UserAuthentication } from '../domain'
import { RepositoryError } from '../errors'

export const hashPassword = async (password: string) =>
  bcrypt.hash(password, 10)

export const comparePassword = async (password: string, passwordHash: string) =>
  bcrypt.compare(password, passwordHash)

type FindUserById = (
  deps: { client: DBClient },
  params: { id: string }
) => Promise<Result<RepositoryError, UserAuthentication>>

export const findUserById: FindUserById = async (dependencies, params) => {
  const records = await dependencies.client.query(sql`
      SELECT * FROM user_authentication
      WHERE id=${params.id}
      LIMIT 1
  `)
  const record = records.rows[0]
  if (!record) { return Err('NOT_FOUND') }

  return Ok(record)
}

type FindUserByIdentifier = (
  deps: { client: DBClient },
  params: { userIdentifier: string }
) => Promise<Result<RepositoryError, UserAuthentication>>

export const findUserByIdentifier: FindUserByIdentifier = async (dependencies, params) => {
  const records = await dependencies.client.query(sql`
      SELECT * FROM user_authentication
      WHERE user_identifier=${params.userIdentifier}
      LIMIT 1
  `)
  const record = records.rows[0]
  if (!record) { return Err('NOT_FOUND') }
  return Ok(record as UserAuthentication)
}

type FindUserByAuthentication = (
  deps: { client: DBClient },
  params: { userIdentifier: string, password: string}
) => Promise<Result<RepositoryError, UserAuthentication>>

export const findUserByAuthentication: FindUserByAuthentication = async ({ client }, params) => {
  const userResult = await findUserByIdentifier({ client }, params)
  if (!userResult.isOk()) { return userResult }
  const user = userResult.get()

  if (!await comparePassword(params.password, user.password)) {
    return Err('NOT_FOUND')
  }

  return userResult
}

type FindUserByAuthenticationToken = (
  deps: { client: DBClient },
  token: AuthenticationToken
) => Promise<Result<RepositoryError, UserAuthentication>>

export const findUserByAuthenticationToken: FindUserByAuthenticationToken = async ({ client }, token) => {
  const records = await client.query(sql`
      SELECT * FROM user_authentication
      WHERE id=${token.id}
      AND (password_changed_at is null OR password_changed_at <= ${token.createdAt})
      LIMIT 1
  `)

  const record = records.rows[0]
  if (!record) { return Err('NOT_FOUND') }
  return Ok(record)
}
