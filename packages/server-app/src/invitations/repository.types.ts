/** Types generated for queries found in "./src/invitations/repository.sql" */
import { PreparedQuery } from '@pgtyped/query';

import { LocalDateTime } from 'js-joda';

/** 'findInvitationById' parameters type */
export interface IFindInvitationByIdParams {
  id: string | null | void;
}

/** 'findInvitationById' return type */
export interface IFindInvitationByIdResult {
  id: string;
  companyName: string;
  companyId: string;
  inviteeId: string;
  inviterId: string;
  invitedAt: LocalDateTime;
  kind: string | null | undefined;
  answeredAt: LocalDateTime | null | undefined;
}

/** 'findInvitationById' query type */
export interface IFindInvitationByIdQuery {
  params: IFindInvitationByIdParams;
  result: IFindInvitationByIdResult;
}

const findInvitationByIdIR: any = {"name":"findInvitationById","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":68,"b":69,"line":2,"col":37}]}}],"usedParamSet":{"id":true},"statement":{"body":"SELECT * FROM invitation WHERE id = :id","loc":{"a":31,"b":69,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM invitation WHERE id = :id
 * ```
 */
export const findInvitationById = new PreparedQuery<IFindInvitationByIdParams,IFindInvitationByIdResult>(findInvitationByIdIR);


/** 'ensureInvitation' parameters type */
export interface IEnsureInvitationParams {
  id: string | null | void;
  companyName: string | null | void;
  companyId: string | null | void;
  inviteeId: string | null | void;
  inviterId: string | null | void;
  invitedAt: LocalDateTime | null | void;
  kind: string | null | void;
  answeredAt: LocalDateTime | null | void;
}

/** 'ensureInvitation' return type */
export interface IEnsureInvitationResult {
  id: string;
  companyName: string;
  companyId: string;
  inviteeId: string;
  inviterId: string;
  invitedAt: LocalDateTime;
  kind: string | null | undefined;
  answeredAt: LocalDateTime | null | undefined;
}

/** 'ensureInvitation' query type */
export interface IEnsureInvitationQuery {
  params: IEnsureInvitationParams;
  result: IEnsureInvitationResult;
}

const ensureInvitationIR: any = {"name":"ensureInvitation","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":238,"b":239,"line":14,"col":11}]}},{"name":"companyName","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":243,"b":253,"line":14,"col":16}]}},{"name":"companyId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":257,"b":265,"line":14,"col":30}]}},{"name":"inviteeId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":269,"b":277,"line":14,"col":42}]}},{"name":"inviterId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":281,"b":289,"line":14,"col":54}]}},{"name":"invitedAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":293,"b":301,"line":14,"col":66}]}},{"name":"kind","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":305,"b":308,"line":14,"col":78}]}},{"name":"answeredAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":312,"b":321,"line":14,"col":85}]}}],"usedParamSet":{"id":true,"companyName":true,"companyId":true,"inviteeId":true,"inviterId":true,"invitedAt":true,"kind":true,"answeredAt":true},"statement":{"body":"INSERT INTO invitation (\n  id,\n  company_name,\n  company_id,\n  invitee_id,\n  inviter_id,\n  invited_at,\n  kind,\n  answered_at\n) VALUES (:id, :companyName, :companyId, :inviteeId, :inviterId, :invitedAt, :kind, :answeredAt)\nON CONFLICT (id)\nDO UPDATE\n  SET company_name = EXCLUDED.company_name,\n      company_id = EXCLUDED.company_id,\n      invitee_id = EXCLUDED.invitee_id,\n      inviter_id = EXCLUDED.inviter_id,\n      invited_at = EXCLUDED.invited_at,\n      kind = EXCLUDED.kind,\n      answered_at = EXCLUDED.answered_at\nRETURNING *","loc":{"a":102,"b":634,"line":5,"col":0}}};

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


/** 'deleteInvitationById' parameters type */
export interface IDeleteInvitationByIdParams {
  id: string | null | void;
}

/** 'deleteInvitationById' return type */
export interface IDeleteInvitationByIdResult {
  id: string;
  companyName: string;
  companyId: string;
  inviteeId: string;
  inviterId: string;
  invitedAt: LocalDateTime;
  kind: string | null | undefined;
  answeredAt: LocalDateTime | null | undefined;
}

/** 'deleteInvitationById' query type */
export interface IDeleteInvitationByIdQuery {
  params: IDeleteInvitationByIdParams;
  result: IDeleteInvitationByIdResult;
}

const deleteInvitationByIdIR: any = {"name":"deleteInvitationById","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":707,"b":708,"line":29,"col":12}]}}],"usedParamSet":{"id":true},"statement":{"body":"DELETE FROM invitation\nWHERE id = :id\nRETURNING *","loc":{"a":672,"b":720,"line":28,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM invitation
 * WHERE id = :id
 * RETURNING *
 * ```
 */
export const deleteInvitationById = new PreparedQuery<IDeleteInvitationByIdParams,IDeleteInvitationByIdResult>(deleteInvitationByIdIR);


