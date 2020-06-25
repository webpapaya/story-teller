'use strict'

exports.up = function (db) {
  return db.runSql(`
    create table if not exists
    public.invitation (
      id             uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
      company_name   text NOT NULL,
      company_id     uuid NOT NULL,
      invitee_id     uuid NOT NULL,
      inviter_id     uuid NOT NULL,
      invited_at     timestamp NOT NULL,
      kind           text,
      answered_at    timestamp
    );
  `)
}

exports.down = function (db) {
  return db.runSql(`
    drop table if exists public.invitation;
  `)
}

exports._meta = {
  version: 1
}
