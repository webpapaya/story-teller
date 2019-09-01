'use strict'

exports.up = function (db) {
  return db.runSql(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    create table if not exists
    public.events (
      id                uuid PRIMARY KEY DEFAULT uuid_generate_v1(),
      type              text NOT NULL,
      payload           json,
      replaced_by       uuid REFERENCES events(id),
      created_at        timestamp without time zone NOT NULL default (now() at time zone 'utc'),
      UNIQUE(replaced_by),
      CHECK ((payload IS NOT NULL AND replaced_by IS NULL) OR
            (payload IS NULL AND replaced_by IS NOT NULL))
    );

    CREATE RULE events_delete_protection
    AS ON DELETE TO events
    DO INSTEAD NOTHING;
  `)
}

exports.down = function (db) {
  return db.runSql(`
    drop table if exists public.events
  `)
}

exports._meta = {
  version: 1
}
