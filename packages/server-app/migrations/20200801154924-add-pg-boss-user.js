'use strict'

exports.up = function (db) {
  return db.runSql(`
    BEGIN;
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    SELECT pg_advisory_xact_lock(1337968055000);
    CREATE SCHEMA pgboss;

    CREATE TABLE pgboss.version (
      version int primary key,
      maintained_on timestamp with time zone
    );

    CREATE TYPE pgboss.job_state AS ENUM (
      'created',
      'retry',
      'active',
      'completed',
      'expired',
      'cancelled',
      'failed'
    );

    CREATE TABLE pgboss.job (
      id uuid primary key not null default gen_random_uuid(),
      name text not null,
      priority integer not null default(0),
      data jsonb,
      state pgboss.job_state not null default('created'),
      retryLimit integer not null default(0),
      retryCount integer not null default(0),
      retryDelay integer not null default(0),
      retryBackoff boolean not null default false,
      startAfter timestamp with time zone not null default now(),
      startedOn timestamp with time zone,
      singletonKey text,
      singletonOn timestamp without time zone,
      expireIn interval not null default interval '15 minutes',
      createdOn timestamp with time zone not null default now(),
      completedOn timestamp with time zone,
      keepUntil timestamp with time zone NOT NULL default now() + interval '30 days'
    );

    CREATE TABLE pgboss.archive (LIKE pgboss.job);

    CREATE TABLE pgboss.schedule (
      name text primary key,
      cron text not null,
      timezone text,
      data jsonb,
      options jsonb,
      created_on timestamp with time zone not null default now(),
      updated_on timestamp with time zone not null default now()
    );

    CREATE INDEX archive_id_idx ON pgboss.archive(id);
    ALTER TABLE pgboss.archive ADD archivedOn timestamptz NOT NULL DEFAULT now();
    CREATE INDEX archive_archivedon_idx ON pgboss.archive(archivedon);
    CREATE INDEX job_name ON pgboss.job (name text_pattern_ops);

    CREATE UNIQUE INDEX job_singletonOn ON pgboss.job (name, singletonOn) WHERE state < 'expired' AND singletonKey IS NULL;

    CREATE UNIQUE INDEX job_singletonKeyOn ON pgboss.job (name, singletonOn, singletonKey) WHERE state < 'expired';

    CREATE UNIQUE INDEX job_singletonKey ON pgboss.job (name, singletonKey) WHERE state < 'completed' AND singletonOn IS NULL;

    INSERT INTO pgboss.version(version) VALUES ('14');
    COMMIT;
  `)
}

exports.down = function (db) {
  return db.runSql(`
    DROP SCHEMA pgboss cascade;
    DROP EXTENSION IF EXISTS pgcrypto;
  `)
}

exports._meta = {
  version: 1
}



