'use strict'

exports.up = function (db) {
  return db.runSql(`
    create table if not exists
    public.invitation (
      id            uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
      companyName   text NOT NULL,
      companyId     uuid NOT NULL,
      inviteeId     uuid NOT NULL,
      inviterId     uuid NOT NULL,
      invitedAt     timestamp NOT NULL,
      kind          text,
      answeredAt    timestamp
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
