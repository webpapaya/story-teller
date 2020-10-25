'use strict'

exports.up = function (db) {
  return db.runSql(`
    create table if not exists
    public.vacation (
      id              uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
      start_date      date NOT NULL,
      end_date        date NOT NULL,
      person_id       uuid NOT NULL,
      state           text NOT NULL,
      confirmed_by    uuid,
      reason          text
    );
  `)
}

exports.down = function (db) {
  return db.runSql(`
    drop table if exists public.vacation;
  `)
}

exports._meta = {
  version: 1
}
