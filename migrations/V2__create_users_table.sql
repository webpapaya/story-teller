create table if not exists
public.users (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v1(),
  name         text NOT NULL,
  title        json
);