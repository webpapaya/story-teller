/** Types generated for queries found in "./src/authentication/refresh_token_repository/repository.sql" */
import { PreparedQuery } from '@pgtyped/query';

import { LocalDateTime } from 'js-joda';

/** 'whereRefreshToken' parameters type */
export interface IWhereRefreshTokenParams {
  id: string | null | void;
  userId: string | null | void;
}

/** 'whereRefreshToken' return type */
export interface IWhereRefreshTokenResult {
  id: string;
  userId: string;
  token: string;
  createdAt: LocalDateTime;
  expiresOn: LocalDateTime;
}

/** 'whereRefreshToken' query type */
export interface IWhereRefreshTokenQuery {
  params: IWhereRefreshTokenParams;
  result: IWhereRefreshTokenResult;
}

const whereRefreshTokenIR: any = {"name":"whereRefreshToken","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":70,"b":71,"line":3,"col":12}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":88,"b":93,"line":3,"col":30}]}}],"usedParamSet":{"id":true,"userId":true},"statement":{"body":"SELECT * FROM refresh_token\nWHERE id = :id AND user_id = :userId","loc":{"a":30,"b":93,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM refresh_token
 * WHERE id = :id AND user_id = :userId
 * ```
 */
export const whereRefreshToken = new PreparedQuery<IWhereRefreshTokenParams,IWhereRefreshTokenResult>(whereRefreshTokenIR);


/** 'deleteRefreshToken' parameters type */
export interface IDeleteRefreshTokenParams {
  id: string | null | void;
  userId: string | null | void;
}

/** 'deleteRefreshToken' return type */
export interface IDeleteRefreshTokenResult {
  id: string;
  userId: string;
  token: string;
  createdAt: LocalDateTime;
  expiresOn: LocalDateTime;
}

/** 'deleteRefreshToken' query type */
export interface IDeleteRefreshTokenQuery {
  params: IDeleteRefreshTokenParams;
  result: IDeleteRefreshTokenResult;
}

const deleteRefreshTokenIR: any = {"name":"deleteRefreshToken","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":166,"b":167,"line":7,"col":12}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":184,"b":189,"line":7,"col":30}]}}],"usedParamSet":{"id":true,"userId":true},"statement":{"body":"delete from refresh_token\nWHERE id = :id AND user_id = :userId\nRETURNING *","loc":{"a":128,"b":201,"line":6,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * delete from refresh_token
 * WHERE id = :id AND user_id = :userId
 * RETURNING *
 * ```
 */
export const deleteRefreshToken = new PreparedQuery<IDeleteRefreshTokenParams,IDeleteRefreshTokenResult>(deleteRefreshTokenIR);


/** 'ensureRefreshToken' parameters type */
export interface IEnsureRefreshTokenParams {
  id: string | null | void;
  user_id: string | null | void;
  token: string | null | void;
  expires_on: LocalDateTime | null | void;
  created_at: LocalDateTime | null | void;
}

/** 'ensureRefreshToken' return type */
export interface IEnsureRefreshTokenResult {
  id: string;
  userId: string;
  token: string;
  createdAt: LocalDateTime;
  expiresOn: LocalDateTime;
}

/** 'ensureRefreshToken' query type */
export interface IEnsureRefreshTokenQuery {
  params: IEnsureRefreshTokenParams;
  result: IEnsureRefreshTokenResult;
}

const ensureRefreshTokenIR: any = {"name":"ensureRefreshToken","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":316,"b":317,"line":12,"col":9}]}},{"name":"user_id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":321,"b":327,"line":12,"col":14}]}},{"name":"token","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":331,"b":335,"line":12,"col":24}]}},{"name":"expires_on","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":339,"b":348,"line":12,"col":32}]}},{"name":"created_at","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":352,"b":361,"line":12,"col":45}]}}],"usedParamSet":{"id":true,"user_id":true,"token":true,"expires_on":true,"created_at":true},"statement":{"body":"INSERT INTO refresh_token (id, user_id, token, expires_on, created_at)\nVALUES (:id, :user_id, :token, :expires_on, :created_at)\nON CONFLICT (id)\nDO UPDATE\n  SET user_id = EXCLUDED.user_id,\n      token = EXCLUDED.token,\n      expires_on = EXCLUDED.expires_on,\n      created_at = EXCLUDED.created_at\nRETURNING *","loc":{"a":236,"b":544,"line":11,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO refresh_token (id, user_id, token, expires_on, created_at)
 * VALUES (:id, :user_id, :token, :expires_on, :created_at)
 * ON CONFLICT (id)
 * DO UPDATE
 *   SET user_id = EXCLUDED.user_id,
 *       token = EXCLUDED.token,
 *       expires_on = EXCLUDED.expires_on,
 *       created_at = EXCLUDED.created_at
 * RETURNING *
 * ```
 */
export const ensureRefreshToken = new PreparedQuery<IEnsureRefreshTokenParams,IEnsureRefreshTokenResult>(ensureRefreshTokenIR);


