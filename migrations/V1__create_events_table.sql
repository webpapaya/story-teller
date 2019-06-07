CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table if not exists
public.events (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type         text NOT NULL,
  payload      json NOT NULL,
  created_at   timestamp without time zone NOT NULL default (now() at time zone 'utc')
);