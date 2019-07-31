create table if not exists
public.titles (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v1(),
  name         text NOT NULL,
  user_id      uuid
);