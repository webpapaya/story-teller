create table if not exists
public.titles (
  id           serial PRIMARY KEY,
  name         text NOT NULL,
  userId       serial
);