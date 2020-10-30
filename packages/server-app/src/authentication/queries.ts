import bcrypt from 'bcrypt'
import { Result, Ok, Err } from 'space-lift'
import sql from 'sql-template-tag'
import { AuthenticationToken, UserAuthentication } from '../domain'
import { RepositoryError } from '../errors'
import { ExternalDependencies } from '../lib/use-case'

export const hashPassword = async (password: string) =>
  await bcrypt.hash(password, 10)

export const comparePassword = async (password: string, passwordHash: string) =>
  await bcrypt.compare(password, passwordHash)

type FindUserById = (
  deps: ExternalDependencies,
  params: { id: string }
) => Promise<Result<RepositoryError, UserAuthentication>>

export const findUserById: FindUserById = async (clients, params) => {
  const records = await clients.pgClient.query(sql`
      SELECT * FROM user_authentication
      WHERE id=${params.id}
      LIMIT 1
  `)
  const record = records.rows[0]
  if (!record) { return Err('NOT_FOUND') }

  return Ok(record)
}

type FindUserByIdentifier = (
  deps: ExternalDependencies,
  params: { userIdentifier: string }
) => Promise<Result<RepositoryError, UserAuthentication>>

export const findUserByIdentifier: FindUserByIdentifier = async (clients, params) => {
  const records = await clients.pgClient.query(sql`
      SELECT * FROM user_authentication
      WHERE user_identifier=${params.userIdentifier}
      LIMIT 1
  `)
  const record = records.rows[0]
  if (!record) { return Err('NOT_FOUND') }
  return Ok(record as UserAuthentication)
}

type FindUserByAuthentication = (
  deps: ExternalDependencies,
  params: { userIdentifier: string, password: string}
) => Promise<Result<RepositoryError, UserAuthentication>>

export const findUserByAuthentication: FindUserByAuthentication = async (clients, params) => {
  const userResult = await findUserByIdentifier(clients, params)
  if (!userResult.isOk()) { return userResult }
  const user = userResult.get()

  if (!await comparePassword(params.password, user.password)) {
    return Err('NOT_FOUND')
  }

  return userResult
}

type FindUserByAuthenticationToken = (
  deps: ExternalDependencies,
  token: AuthenticationToken
) => Promise<Result<RepositoryError, UserAuthentication>>

export const findUserByAuthenticationToken: FindUserByAuthenticationToken = async (clients, token) => {
  const records = await clients.pgClient.query(sql`
      SELECT * FROM user_authentication
      WHERE id=${token.id}
      AND (password_changed_at is null OR password_changed_at <= ${token.createdAt})
      LIMIT 1
  `)

  const record = records.rows[0]
  if (!record) { return Err('NOT_FOUND') }
  return Ok(record)
}
