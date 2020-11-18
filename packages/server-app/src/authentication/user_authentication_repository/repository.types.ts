/** Types generated for queries found in "./src/authentication/user_authentication_repository/repository.sql" */
import { PreparedQuery } from '@pgtyped/query';

import { LocalDateTime } from 'js-joda';

/** 'whereUserAuthentication' parameters type */
export interface IWhereUserAuthenticationParams {
  id: string | null | void;
}

/** 'whereUserAuthentication' return type */
export interface IWhereUserAuthenticationResult {
  id: string;
  userIdentifier: string;
  createdAt: LocalDateTime;
  confirmationToken: string | null | undefined;
  confirmationTimestamp: LocalDateTime | null | undefined;
  password: string;
  passwordResetToken: string | null | undefined;
  passwordResetTimestamp: LocalDateTime | null | undefined;
}

/** 'whereUserAuthentication' query type */
export interface IWhereUserAuthenticationQuery {
  params: IWhereUserAuthenticationParams;
  result: IWhereUserAuthenticationResult;
}

const whereUserAuthenticationIR: any = {"name":"whereUserAuthentication","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":82,"b":83,"line":2,"col":46}]}}],"usedParamSet":{"id":true},"statement":{"body":"SELECT * FROM user_authentication WHERE id = :id","loc":{"a":36,"b":83,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM user_authentication WHERE id = :id
 * ```
 */
export const whereUserAuthentication = new PreparedQuery<IWhereUserAuthenticationParams,IWhereUserAuthenticationResult>(whereUserAuthenticationIR);


/** 'ensureUserAuthentication' parameters type */
export interface IEnsureUserAuthenticationParams {
  id: string | null | void;
  created_at: LocalDateTime | null | void;
  user_identifier: string | null | void;
  confirmation_token: string | null | void;
  confirmation_timestamp: LocalDateTime | null | void;
  password: string | null | void;
  password_reset_token: string | null | void;
  password_reset_timestamp: LocalDateTime | null | void;
}

/** 'ensureUserAuthentication' return type */
export interface IEnsureUserAuthenticationResult {
  id: string;
  userIdentifier: string;
  createdAt: LocalDateTime;
  confirmationToken: string | null | undefined;
  confirmationTimestamp: LocalDateTime | null | undefined;
  password: string;
  passwordResetToken: string | null | undefined;
  passwordResetTimestamp: LocalDateTime | null | undefined;
}

/** 'ensureUserAuthentication' query type */
export interface IEnsureUserAuthenticationQuery {
  params: IEnsureUserAuthenticationParams;
  result: IEnsureUserAuthenticationResult;
}

const ensureUserAuthenticationIR: any = {"name":"ensureUserAuthentication","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":322,"b":323,"line":15,"col":3}]}},{"name":"created_at","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":329,"b":338,"line":16,"col":3}]}},{"name":"user_identifier","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":344,"b":358,"line":17,"col":3}]}},{"name":"confirmation_token","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":364,"b":381,"line":18,"col":3}]}},{"name":"confirmation_timestamp","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":387,"b":408,"line":19,"col":3}]}},{"name":"password","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":414,"b":421,"line":20,"col":3}]}},{"name":"password_reset_token","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":427,"b":446,"line":21,"col":3}]}},{"name":"password_reset_timestamp","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":452,"b":475,"line":22,"col":3}]}}],"usedParamSet":{"id":true,"created_at":true,"user_identifier":true,"confirmation_token":true,"confirmation_timestamp":true,"password":true,"password_reset_token":true,"password_reset_timestamp":true},"statement":{"body":"INSERT INTO user_authentication (\n  id,\n  created_at,\n  user_identifier,\n  confirmation_token,\n  confirmation_timestamp,\n  password,\n  password_reset_token,\n  password_reset_timestamp\n) VALUES (\n  :id,\n  :created_at,\n  :user_identifier,\n  :confirmation_token,\n  :confirmation_timestamp,\n  :password,\n  :password_reset_token,\n  :password_reset_timestamp\n)\nON CONFLICT (id)\nDO UPDATE\n  SET created_at=EXCLUDED.created_at,\n      user_identifier=EXCLUDED.user_identifier,\n      confirmation_token=EXCLUDED.confirmation_token,\n      confirmation_timestamp=EXCLUDED.confirmation_timestamp,\n      password=EXCLUDED.password,\n      password_reset_token=EXCLUDED.password_reset_token,\n      password_reset_timestamp=EXCLUDED.password_reset_timestamp\nRETURNING *","loc":{"a":124,"b":875,"line":5,"col":0}}};

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
export const ensureUserAuthentication = new PreparedQuery<IEnsureUserAuthenticationParams,IEnsureUserAuthenticationResult>(ensureUserAuthenticationIR);


