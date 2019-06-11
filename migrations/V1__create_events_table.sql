CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table if not exists
public.events (
  id                serial PRIMARY KEY,
  type              text NOT NULL,
  payload           json,
  replaced_by       int REFERENCES events(id),
  created_at        timestamp without time zone NOT NULL default (now() at time zone 'utc'),
  UNIQUE(replaced_by),
  CHECK ((payload IS NOT NULL AND replaced_by IS NULL) OR
         (payload IS NULL AND replaced_by IS NOT NULL))
);

CREATE RULE events_delete_protection
AS ON DELETE TO events
DO INSTEAD NOTHING;
