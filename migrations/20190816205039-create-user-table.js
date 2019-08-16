'use strict'

exports.up = function (db) {
  return db.runSql(`
    create table if not exists
    public.users (
      id           uuid PRIMARY KEY DEFAULT uuid_generate_v1(),
      name         text NOT NULL,
      title        json
    );
  `)
}

exports.down = function (db) {
  return db.runSql(`
    drop table if exists public.users;
  `)
}

exports._meta = {
  'version': 1
}
