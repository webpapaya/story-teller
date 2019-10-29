'use strict'

exports.up = function (db) {
  return db.runSql(`
    create table if not exists
    public.tag (
      id                         uuid PRIMARY KEY DEFAULT uuid_generate_v1(),
      name                       text not null,
      color                      text not null,
      created_at                 timestamp without time zone NOT NULL default (now() at time zone 'utc')
    );

    create table if not exists
    public.tag_for_feature (
      tag_id                     uuid NOT NULL REFERENCES public.tag(id) ON DELETE CASCADE,
      feature_id                 uuid NOT NULL REFERENCES public.feature(id) ON DELETE CASCADE,
      created_at                 timestamp without time zone NOT NULL default (now() at time zone 'utc')
    );
  `)
}

exports.down = function (db) {
  return db.runSql(`
    drop table if exists public.tag_for_feature;
    drop table if exists public.tag;
  `)
}

exports._meta = {
  version: 1
}
