/** Types generated for queries found in "./src/authentication/user_authentication_repository/repository.sql" */
import { PreparedQuery } from '@pgtyped/query'

import { LocalDateTime } from 'js-joda'

/** 'whereUserAuthentication' parameters type */
export interface IWhereUserAuthenticationParams {
  id: string | null | void
}

/** 'whereUserAuthentication' return type */
export interface IWhereUserAuthenticationResult {
  id: string
  userIdentifier: string
  createdAt: LocalDateTime
  confirmationToken: string | null | undefined
  confirmationTimestamp: LocalDateTime | null | undefined
  password: string
  passwordResetToken: string | null | undefined
  passwordResetTimestamp: LocalDateTime | null | undefined
}

/** 'whereUserAuthentication' query type */
export interface IWhereUserAuthenticationQuery {
  params: IWhereUserAuthenticationParams
  result: IWhereUserAuthenticationResult
}

const whereUserAuthenticationIR: any = { name: 'whereUserAuthentication', params: [{ name: 'id', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 82, b: 83, line: 3, col: 12 }] } }], usedParamSet: { id: true }, statement: { body: 'SELECT * FROM user_authentication\nWHERE id = :id', loc: { a: 36, b: 83, line: 2, col: 0 } } }

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM user_authentication
 * WHERE id = :id
 * ```
 */
export const whereUserAuthentication = new PreparedQuery<IWhereUserAuthenticationParams, IWhereUserAuthenticationResult>(whereUserAuthenticationIR)

/** 'whereUserAuthenticationByUserIdentifier' parameters type */
export interface IWhereUserAuthenticationByUserIdentifierParams {
  user_identifier: string | null | void
}

/** 'whereUserAuthenticationByUserIdentifier' return type */
export interface IWhereUserAuthenticationByUserIdentifierResult {
  id: string
  userIdentifier: string
  createdAt: LocalDateTime
  confirmationToken: string | null | undefined
  confirmationTimestamp: LocalDateTime | null | undefined
  password: string
  passwordResetToken: string | null | undefined
  passwordResetTimestamp: LocalDateTime | null | undefined
}

/** 'whereUserAuthenticationByUserIdentifier' query type */
export interface IWhereUserAuthenticationByUserIdentifierQuery {
  params: IWhereUserAuthenticationByUserIdentifierParams
  result: IWhereUserAuthenticationByUserIdentifierResult
}

const whereUserAuthenticationByUserIdentifierIR: any = { name: 'whereUserAuthenticationByUserIdentifier', params: [{ name: 'user_identifier', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 180, b: 194, line: 7, col: 7 }, { a: 199, b: 213, line: 7, col: 26 }] } }], usedParamSet: { user_identifier: true }, statement: { body: 'SELECT * FROM user_authentication\nWHERE :user_identifier = :user_identifier', loc: { a: 139, b: 213, line: 6, col: 0 } } }

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM user_authentication
 * WHERE :user_identifier = :user_identifier
 * ```
 */
export const whereUserAuthenticationByUserIdentifier = new PreparedQuery<IWhereUserAuthenticationByUserIdentifierParams, IWhereUserAuthenticationByUserIdentifierResult>(whereUserAuthenticationByUserIdentifierIR)

/** 'createUserAuthentication' parameters type */
export interface ICreateUserAuthenticationParams {
  id: string | null | void
  created_at: LocalDateTime | null | void
  user_identifier: string | null | void
  confirmation_token: string | null | void
  confirmation_timestamp: LocalDateTime | null | void
  password: string | null | void
  password_reset_token: string | null | void
  password_reset_timestamp: LocalDateTime | null | void
}

/** 'createUserAuthentication' return type */
export interface ICreateUserAuthenticationResult {
  id: string
  userIdentifier: string
  createdAt: LocalDateTime
  confirmationToken: string | null | undefined
  confirmationTimestamp: LocalDateTime | null | undefined
  password: string
  passwordResetToken: string | null | undefined
  passwordResetTimestamp: LocalDateTime | null | undefined
}

/** 'createUserAuthentication' query type */
export interface ICreateUserAuthenticationQuery {
  params: ICreateUserAuthenticationParams
  result: ICreateUserAuthenticationResult
}

const createUserAuthenticationIR: any = { name: 'createUserAuthentication', params: [{ name: 'id', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 454, b: 455, line: 22, col: 3 }] } }, { name: 'created_at', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 461, b: 470, line: 23, col: 3 }] } }, { name: 'user_identifier', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 476, b: 490, line: 24, col: 3 }] } }, { name: 'confirmation_token', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 496, b: 513, line: 25, col: 3 }] } }, { name: 'confirmation_timestamp', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 519, b: 540, line: 26, col: 3 }] } }, { name: 'password', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 546, b: 553, line: 27, col: 3 }] } }, { name: 'password_reset_token', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 559, b: 578, line: 28, col: 3 }] } }, { name: 'password_reset_timestamp', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 584, b: 607, line: 29, col: 3 }] } }], usedParamSet: { id: true, created_at: true, user_identifier: true, confirmation_token: true, confirmation_timestamp: true, password: true, password_reset_token: true, password_reset_timestamp: true }, statement: { body: 'INSERT INTO user_authentication (\n  id,\n  created_at,\n  user_identifier,\n  confirmation_token,\n  confirmation_timestamp,\n  password,\n  password_reset_token,\n  password_reset_timestamp\n) VALUES (\n  :id,\n  :created_at,\n  :user_identifier,\n  :confirmation_token,\n  :confirmation_timestamp,\n  :password,\n  :password_reset_token,\n  :password_reset_timestamp\n)\nRETURNING *', loc: { a: 256, b: 621, line: 12, col: 0 } } }

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_authentication (
 *   id,
 *   created_at,
 *   user_identifier,
 *   confirmation_token,
 *   confirmation_timestamp,
 *   password,
 *   password_reset_token,
 *   password_reset_timestamp
 * ) VALUES (
 *   :id,
 *   :created_at,
 *   :user_identifier,
 *   :confirmation_token,
 *   :confirmation_timestamp,
 *   :password,
 *   :password_reset_token,
 *   :password_reset_timestamp
 * )
 * RETURNING *
 * ```
 */
export const createUserAuthentication = new PreparedQuery<ICreateUserAuthenticationParams, ICreateUserAuthenticationResult>(createUserAuthenticationIR)

/** 'ensureUserAuthentication' parameters type */
export interface IEnsureUserAuthenticationParams {
  id: string | null | void
  created_at: LocalDateTime | null | void
  user_identifier: string | null | void
  confirmation_token: string | null | void
  confirmation_timestamp: LocalDateTime | null | void
  password: string | null | void
  password_reset_token: string | null | void
  password_reset_timestamp: LocalDateTime | null | void
}

/** 'ensureUserAuthentication' return type */
export interface IEnsureUserAuthenticationResult {
  id: string
  userIdentifier: string
  createdAt: LocalDateTime
  confirmationToken: string | null | undefined
  confirmationTimestamp: LocalDateTime | null | undefined
  password: string
  passwordResetToken: string | null | undefined
  passwordResetTimestamp: LocalDateTime | null | undefined
}

/** 'ensureUserAuthentication' query type */
export interface IEnsureUserAuthenticationQuery {
  params: IEnsureUserAuthenticationParams
  result: IEnsureUserAuthenticationResult
}

const ensureUserAuthenticationIR: any = { name: 'ensureUserAuthentication', params: [{ name: 'id', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 861, b: 862, line: 45, col: 3 }] } }, { name: 'created_at', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 868, b: 877, line: 46, col: 3 }] } }, { name: 'user_identifier', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 883, b: 897, line: 47, col: 3 }] } }, { name: 'confirmation_token', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 903, b: 920, line: 48, col: 3 }] } }, { name: 'confirmation_timestamp', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 926, b: 947, line: 49, col: 3 }] } }, { name: 'password', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 953, b: 960, line: 50, col: 3 }] } }, { name: 'password_reset_token', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 966, b: 985, line: 51, col: 3 }] } }, { name: 'password_reset_timestamp', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 991, b: 1014, line: 52, col: 3 }] } }], usedParamSet: { id: true, created_at: true, user_identifier: true, confirmation_token: true, confirmation_timestamp: true, password: true, password_reset_token: true, password_reset_timestamp: true }, statement: { body: 'INSERT INTO user_authentication (\n  id,\n  created_at,\n  user_identifier,\n  confirmation_token,\n  confirmation_timestamp,\n  password,\n  password_reset_token,\n  password_reset_timestamp\n) VALUES (\n  :id,\n  :created_at,\n  :user_identifier,\n  :confirmation_token,\n  :confirmation_timestamp,\n  :password,\n  :password_reset_token,\n  :password_reset_timestamp\n)\nON CONFLICT (id)\nDO UPDATE\n  SET created_at=EXCLUDED.created_at,\n      user_identifier=EXCLUDED.user_identifier,\n      confirmation_token=EXCLUDED.confirmation_token,\n      confirmation_timestamp=EXCLUDED.confirmation_timestamp,\n      password=EXCLUDED.password,\n      password_reset_token=EXCLUDED.password_reset_token,\n      password_reset_timestamp=EXCLUDED.password_reset_timestamp\nRETURNING *', loc: { a: 663, b: 1414, line: 35, col: 0 } } }

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_authentication (
 *   id,
 *   created_at,
 *   user_identifier,
 *   confirmation_token,
 *   confirmation_timestamp,
 *   password,
 *   password_reset_token,
 *   password_reset_timestamp
 * ) VALUES (
 *   :id,
 *   :created_at,
 *   :user_identifier,
 *   :confirmation_token,
 *   :confirmation_timestamp,
 *   :password,
 *   :password_reset_token,
 *   :password_reset_timestamp
 * )
 * ON CONFLICT (id)
 * DO UPDATE
 *   SET created_at=EXCLUDED.created_at,
 *       user_identifier=EXCLUDED.user_identifier,
 *       confirmation_token=EXCLUDED.confirmation_token,
 *       confirmation_timestamp=EXCLUDED.confirmation_timestamp,
 *       password=EXCLUDED.password,
 *       password_reset_token=EXCLUDED.password_reset_token,
 *       password_reset_timestamp=EXCLUDED.password_reset_timestamp
 * RETURNING *
 * ```
 */
export const ensureUserAuthentication = new PreparedQuery<IEnsureUserAuthenticationParams, IEnsureUserAuthenticationResult>(ensureUserAuthenticationIR)
