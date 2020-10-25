'use strict'

exports.up = function (db) {
  return db.runSql(`
    create table if not exists
    public.vacation (
      id              uuid PRIMARY KEY,
      start_date      date NOT NULL,
      end_date        date NOT NULL,
      employee_id     uuid NOT NULL,
      state           text NOT NULL,
      answered_by     uuid,
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
