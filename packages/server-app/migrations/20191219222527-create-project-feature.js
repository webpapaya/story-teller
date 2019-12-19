'use strict'

exports.up = function (db) {
  return db.runSql(`
    create table if not exists
    public.project_feature (
      id                         uuid DEFAULT uuid_generate_v1(),
      project_id                 uuid NOT NULL REFERENCES public.project(id) ON DELETE CASCADE,
      feature_id                 uuid NOT NULL REFERENCES public.feature(id) ON DELETE CASCADE,
      PRIMARY KEY (project_id, feature_id)
    );
  `)
}

exports.down = function (db) {
  return db.runSql(`
    drop table if exists public.project_feature;
  `)
}

exports._meta = {
  version: 1
}
