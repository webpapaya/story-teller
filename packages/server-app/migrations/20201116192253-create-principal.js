'use strict'


// a sample tag function
function sql([literals]) {
    return literals;
}

exports.up = function (db) {
  return db.runSql(sql`
    CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;

    CREATE TABLE oauth_tokens (
        id uuid NOT NULL,
        access_token text NOT NULL,
        access_token_expires_on timestamp without time zone NOT NULL,
        client_id text NOT NULL,
        refresh_token text NOT NULL,
        refresh_token_expires_on timestamp without time zone NOT NULL,
        user_id uuid NOT NULL
    );

    CREATE TABLE oauth_clients (
        client_id text NOT NULL,
        client_secret text NOT NULL,
        redirect_uri text NOT NULL
    );

    CREATE TABLE principal (
        id uuid NOT NULL,
        username text NOT NULL,
        password text NOT NULL
    );

    ALTER TABLE ONLY oauth_tokens
        ADD CONSTRAINT oauth_tokens_pkey PRIMARY KEY (id);

    ALTER TABLE ONLY oauth_clients
        ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (client_id, client_secret);

    ALTER TABLE ONLY principal
        ADD CONSTRAINT principal_pkey PRIMARY KEY (id);

    CREATE INDEX principal_username_password ON principal USING btree (username, password);
  `)
}

exports.down = function (db) {
  return db.runSql(sql`
    drop table if exists oauth_tokens;
    drop table if exists oauth_clients;
    drop table if exists principal;
  `)
}

exports._meta = {
  version: 1
}
