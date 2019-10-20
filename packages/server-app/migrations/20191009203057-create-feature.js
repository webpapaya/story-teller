'use strict'

exports.up = function (db) {
  return db.runSql(`
    create table if not exists
    public.feature (
      id                         uuid PRIMARY KEY DEFAULT uuid_generate_v1(),
      title                      text not null,
      description                text not null,
      previous_feature_id        uuid REFERENCES public.feature(id) ON DELETE CASCADE,
      next_feature_id            uuid REFERENCES public.feature(id) ON DELETE CASCADE,
      created_at                 timestamp without time zone NOT NULL default (now() at time zone 'utc')
    );
  `)
}

exports.down = function (db) {
  return db.runSql(`
    drop table if exists public.feature
  `)
}

exports._meta = {
  version: 1
}
