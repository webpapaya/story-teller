'use strict'

exports.up = function (db) {
  return db.runSql(`
    create table if not exists
    public.contributor (
      id                         uuid DEFAULT uuid_generate_v1(),
      project_id                 uuid NOT NULL REFERENCES public.project(id) ON DELETE CASCADE,
      contributor_id             uuid REFERENCES public.user_authentication(id) ON DELETE SET NULL,
      invitation_accepted_at     timestamp without time zone,
      created_at                 timestamp without time zone NOT NULL default (now() at time zone 'utc'),
      PRIMARY KEY (project_id, contributor_id)
    );
  `)
}

exports.down = function (db) {
  return db.runSql(`
    drop table if exists public.contributor;
  `)
}

exports._meta = {
  version: 1
}
