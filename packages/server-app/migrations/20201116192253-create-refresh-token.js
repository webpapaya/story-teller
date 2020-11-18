'use strict'

// a sample tag function
function sql ([literals]) {
  return literals
}

exports.up = function (db) {
  return db.runSql(sql`
    CREATE TABLE refresh_token (
        id uuid NOT NULL,
        user_id uuid NOT NULL,
        token text NOT NULL,
        created_at timestamp without time zone NOT NULL,
        expires_on timestamp without time zone NOT NULL
    );
  `)
}

exports.down = function (db) {
  return db.runSql(sql`
    drop table if exists refresh_token;
  `)
}

exports._meta = {
  version: 1
}
