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

const ensureInvitationIR: any = {"name":"ensureInvitation","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":239,"b":240,"line":15,"col":11}]}},{"name":"companyName","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":244,"b":254,"line":15,"col":16}]}},{"name":"companyId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":258,"b":266,"line":15,"col":30}]}},{"name":"inviteeId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":270,"b":278,"line":15,"col":42}]}},{"name":"inviterId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":282,"b":290,"line":15,"col":54}]}},{"name":"invitedAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":294,"b":302,"line":15,"col":66}]}},{"name":"kind","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":306,"b":309,"line":15,"col":78}]}},{"name":"answeredAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":313,"b":322,"line":15,"col":85}]}}],"usedParamSet":{"id":true,"companyName":true,"companyId":true,"inviteeId":true,"inviterId":true,"invitedAt":true,"kind":true,"answeredAt":true},"statement":{"body":"INSERT INTO invitation (\n  id,\n  company_name,\n  company_id,\n  invitee_id,\n  inviter_id,\n  invited_at,\n  kind,\n  answered_at\n) VALUES (:id, :companyName, :companyId, :inviteeId, :inviterId, :invitedAt, :kind, :answeredAt)\nON CONFLICT (id)\nDO UPDATE\n  SET company_name = EXCLUDED.company_name,\n      company_id = EXCLUDED.company_id,\n      invitee_id = EXCLUDED.invitee_id,\n      inviter_id = EXCLUDED.inviter_id,\n      invited_at = EXCLUDED.invited_at,\n      kind = EXCLUDED.kind,\n      answered_at = EXCLUDED.answered_at\nRETURNING *","loc":{"a":103,"b":635,"line":6,"col":0}}};

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


