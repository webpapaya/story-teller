'use strict'

exports.up = function (db) {
  return db.runSql(`
    create table if not exists
    public.user_authentication (
      id                          uuid PRIMARY KEY DEFAULT uuid_generate_v1(),
      user_identifier             text NOT NULL UNIQUE,
      created_at                  timestamp without time zone NOT NULL,

      confirmation_token          text,
      confirmed_at                timestamp without time zone,

      password                    text NOT NULL,
      password_reset_token        text UNIQUE,
      password_reset_created_at   timestamp without time zone,

      password_changed_at         timestamp without time zone
    );
  `)
}

exports.down = function (db) {
  return db.runSql(`
    drop table if exists public.user_authentication
  `)
}

exports._meta = {
  version: 1
}
