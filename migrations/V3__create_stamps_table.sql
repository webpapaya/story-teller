create table if not exists
public.stamps (
  id           serial PRIMARY KEY,
  type         text NOT NULL,
  timestamp    timestamp with time zone NOT NULL,
  location     point,
  note         text
);