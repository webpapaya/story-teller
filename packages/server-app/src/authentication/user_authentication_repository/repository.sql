/* @name whereUserAuthentication */
SELECT * FROM user_authentication
WHERE id = :id;

/* @name whereUserAuthenticationByUserIdentifier */
SELECT * FROM user_authentication
WHERE :user_identifier = :user_identifier;


/* @name ensureUserAuthentication */
INSERT INTO user_authentication (
  id,
  created_at,
  user_identifier,
  confirmation_token,
  confirmation_timestamp,
  password,
  password_reset_token,
  password_reset_timestamp
) VALUES (
  :id,
  :created_at,
  :user_identifier,
  :confirmation_token,
  :confirmation_timestamp,
  :password,
  :password_reset_token,
  :password_reset_timestamp
)
ON CONFLICT (id)
DO UPDATE
  SET created_at=EXCLUDED.created_at,
      user_identifier=EXCLUDED.user_identifier,
      confirmation_token=EXCLUDED.confirmation_token,
      confirmation_timestamp=EXCLUDED.confirmation_timestamp,
      password=EXCLUDED.password,
      password_reset_token=EXCLUDED.password_reset_token,
      password_reset_timestamp=EXCLUDED.password_reset_timestamp
RETURNING *;
