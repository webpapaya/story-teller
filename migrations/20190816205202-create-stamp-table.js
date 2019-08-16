'use strict'

exports.up = function (db) {
  return db.runSql(`
    create table if not exists
    public.stamps (
      id           uuid PRIMARY KEY DEFAULT uuid_generate_v1(),
      type         text NOT NULL,
      timestamp    timestamp with time zone NOT NULL,
      location     point,
      note         text
    );
  `)
}

exports.down = function (db) {
  return db.runSql(`
    drop table if exists public.stamps;
  `)
}

exports._meta = {
  'version': 1
}
