create table if not exists
public.users (
  id           serial PRIMARY KEY,
  name         text NOT NULL,
  title        json
);