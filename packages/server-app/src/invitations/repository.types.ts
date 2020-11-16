/** Types generated for queries found in "./src/invitations/repository.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'WhereInvitationId' parameters type */
export interface IWhereInvitationIdParams {
  id: string | null | void;
}

/** 'WhereInvitationId' return type */
export interface IWhereInvitationIdResult {
  id: string;
  companyName: string;
  companyId: string;
  inviteeId: string;
  inviterId: string;
  invitedAt: Date;
  kind: string | null;
  answeredAt: Date | null;
}

/** 'WhereInvitationId' query type */
export interface IWhereInvitationIdQuery {
  params: IWhereInvitationIdParams;
  result: IWhereInvitationIdResult;
}

const whereInvitationIdIR: any = {"name":"whereInvitationId","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":67,"b":68,"line":2,"col":37}]}}],"usedParamSet":{"id":true},"statement":{"body":"SELECT * FROM invitation WHERE id = :id","loc":{"a":30,"b":68,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM invitation WHERE id = :id
 * ```
 */
export const whereInvitationId = new PreparedQuery<IWhereInvitationIdParams,IWhereInvitationIdResult>(whereInvitationIdIR);


/** 'EnsureInvitation' parameters type */
export interface IEnsureInvitationParams {
  id: string | null | void;
  companyName: string | null | void;
  companyId: string | null | void;
  inviteeId: string | null | void;
  inviterId: string | null | void;
  invitedAt: Date | null | void;
  kind: string | null | void;
  answeredAt: Date | null | void;
}

/** 'EnsureInvitation' return type */
export interface IEnsureInvitationResult {
  id: string;
  companyName: string;
  companyId: string;
  inviteeId: string;
  inviterId: string;
  invitedAt: Date;
  kind: string | null;
  answeredAt: Date | null;
}

/** 'EnsureInvitation' query type */
export interface IEnsureInvitationQuery {
  params: IEnsureInvitationParams;
  result: IEnsureInvitationResult;
}

const ensureInvitationIR: any = {"name":"ensureInvitation","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":237,"b":238,"line":14,"col":11}]}},{"name":"companyName","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":242,"b":252,"line":14,"col":16}]}},{"name":"companyId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":256,"b":264,"line":14,"col":30}]}},{"name":"inviteeId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":268,"b":276,"line":14,"col":42}]}},{"name":"inviterId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":280,"b":288,"line":14,"col":54}]}},{"name":"invitedAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":292,"b":300,"line":14,"col":66}]}},{"name":"kind","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":304,"b":307,"line":14,"col":78}]}},{"name":"answeredAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":311,"b":320,"line":14,"col":85}]}}],"usedParamSet":{"id":true,"companyName":true,"companyId":true,"inviteeId":true,"inviterId":true,"invitedAt":true,"kind":true,"answeredAt":true},"statement":{"body":"INSERT INTO invitation (\n  id,\n  company_name,\n  company_id,\n  invitee_id,\n  inviter_id,\n  invited_at,\n  kind,\n  answered_at\n) VALUES (:id, :companyName, :companyId, :inviteeId, :inviterId, :invitedAt, :kind, :answeredAt)\nON CONFLICT (id)\nDO UPDATE\n  SET company_name = EXCLUDED.company_name,\n      company_id = EXCLUDED.company_id,\n      invitee_id = EXCLUDED.invitee_id,\n      inviter_id = EXCLUDED.inviter_id,\n      invited_at = EXCLUDED.invited_at,\n      kind = EXCLUDED.kind,\n      answered_at = EXCLUDED.answered_at\nRETURNING *","loc":{"a":101,"b":633,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO invitation (
 *   id,
 *   company_name,
 *   company_id,
 *   invitee_id,
 *   inviter_id,
 *   invited_at,
 *   kind,
 *   answered_at
 * ) VALUES (:id, :companyName, :companyId, :inviteeId, :inviterId, :invitedAt, :kind, :answeredAt)
 * ON CONFLICT (id)
 * DO UPDATE
 *   SET company_name = EXCLUDED.company_name,
 *       company_id = EXCLUDED.company_id,
 *       invitee_id = EXCLUDED.invitee_id,
 *       inviter_id = EXCLUDED.inviter_id,
 *       invited_at = EXCLUDED.invited_at,
 *       kind = EXCLUDED.kind,
 *       answered_at = EXCLUDED.answered_at
 * RETURNING *
 * ```
 */
export const ensureInvitation = new PreparedQuery<IEnsureInvitationParams,IEnsureInvitationResult>(ensureInvitationIR);


/** 'DeleteInvitationById' parameters type */
export interface IDeleteInvitationByIdParams {
  id: string | null | void;
}

/** 'DeleteInvitationById' return type */
export interface IDeleteInvitationByIdResult {
  id: string;
  companyName: string;
  companyId: string;
  inviteeId: string;
  inviterId: string;
  invitedAt: Date;
  kind: string | null;
  answeredAt: Date | null;
}

/** 'DeleteInvitationById' query type */
export interface IDeleteInvitationByIdQuery {
  params: IDeleteInvitationByIdParams;
  result: IDeleteInvitationByIdResult;
}

const deleteInvitationByIdIR: any = {"name":"deleteInvitationById","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":706,"b":707,"line":29,"col":12}]}}],"usedParamSet":{"id":true},"statement":{"body":"DELETE FROM invitation\nWHERE id = :id\nRETURNING *","loc":{"a":671,"b":719,"line":28,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM invitation
 * WHERE id = :id
 * RETURNING *
 * ```
 */
export const deleteInvitationById = new PreparedQuery<IDeleteInvitationByIdParams,IDeleteInvitationByIdResult>(deleteInvitationByIdIR);


