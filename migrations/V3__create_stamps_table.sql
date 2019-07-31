create table if not exists
public.stamps (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v1(),
  type         text NOT NULL,
  timestamp    timestamp with time zone NOT NULL,
  location     point,
  note         text
);