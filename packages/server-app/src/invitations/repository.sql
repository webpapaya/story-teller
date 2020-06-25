/* @name findInvitationById */
SELECT * FROM invitation WHERE id = :id;


/* @name ensureInvitation */
INSERT INTO invitation (
  id,
  company_name,
  company_id,
  invitee_id,
  inviter_id,
  invited_at,
  kind,
  answered_at
) VALUES (:id, :companyName, :companyId, :inviteeId, :inviterId, :invitedAt, :kind, :answeredAt)
ON CONFLICT (id)
DO UPDATE
  SET company_name = EXCLUDED.company_name,
      company_id = EXCLUDED.company_id,
      invitee_id = EXCLUDED.invitee_id,
      inviter_id = EXCLUDED.inviter_id,
      invited_at = EXCLUDED.invited_at,
      kind = EXCLUDED.kind,
      answered_at = EXCLUDED.answered_at
RETURNING *;
