/* @name whereRefreshToken */
SELECT * FROM refresh_token
WHERE id = :id AND user_id = :userId;

/* @name ensureRefreshToken */
INSERT INTO refresh_token (id, user_id, token, expires_on, created_at)
VALUES (:id, :user_id, :token, :expires_on, :created_at)
ON CONFLICT (id)
DO UPDATE
  SET user_id = EXCLUDED.user_id,
      token = EXCLUDED.token,
      expires_on = EXCLUDED.expires_on,
      created_at = EXCLUDED.created_at
RETURNING *;
