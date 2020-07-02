'use strict'

exports.up = function (db) {
  return db.runSql(`
    create table if not exists
    public.company (
      id             uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
      name           text NOT NULL
    );

    create table if not exists
    public.company_employee (
      id             uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
      role           text NOT NULL,
      company_id     uuid REFERENCES public.company(id) ON DELETE CASCADE
    );
  `)
}

exports.down = function (db) {
  return db.runSql(`
    drop table if exists public.company_employee;
    drop table if exists public.company;
  `)
}

exports._meta = {
  version: 1
}
