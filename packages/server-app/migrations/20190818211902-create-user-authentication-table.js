'use strict'

exports.up = function (db) {
  return db.runSql(`
    create table if not exists
    public.user_authentication (
      id                uuid PRIMARY KEY DEFAULT uuid_generate_v1(),
      user_identifier   text,
      password          text
    );
  `)
}

exports.down = function (db) {
  return db.runSql(`
    drop table if exists public.user_authentication
  `)
}

exports._meta = {
  'version': 1
}
