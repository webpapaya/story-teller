'use strict'

exports.up = function (db) {
  return db.runSql(`
    create table if not exists
    public.project (
      id                         uuid PRIMARY KEY DEFAULT uuid_generate_v1(),
      name                       text not null,
      created_at                 timestamp without time zone NOT NULL default (now() at time zone 'utc')
    );
  `)
}

exports.down = function (db) {
  return db.runSql(`
    drop table if exists public.project;
  `)
}

exports._meta = {
  version: 1
}
