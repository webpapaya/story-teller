import pg, { Pool, PoolClient } from 'pg';
import { ZonedDateTime, LocalDate, LocalTime, ZoneOffset } from 'js-joda';

const pool = new Pool({
  host: 'localhost',
  user: 'dbuser',
  password: 'password',
  database: 'compup',
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,

});

pg.types.setTypeParser(1184, (dateTimeAsString) => {
  if (!dateTimeAsString) { return null; }
  const [date, timeWithZone] = dateTimeAsString.split(' ');
  return ZonedDateTime.of(
    LocalDate.parse(date),
    LocalTime.parse(timeWithZone.slice(0, 8)),
    ZoneOffset.UTC,
  );
});


export type DBClient = PoolClient;
export type WithinConnection = <T>(fn: (deps: TransactionParams) => T) => Promise<T>;


type TransactionParams = {
  client: DBClient,
  begin: () => Promise<void>,
  commit: () => Promise<void>,
  rollback: () => Promise<void>
}


export const withinConnection: WithinConnection = async (fn) => {
  const client = await pool.connect();
  const begin = async () => { await client.query('BEGIN') };
  const commit = async () => { await client.query('COMMIT') };
  const rollback = async () => { await client.query('ROLLBACK') };
  try {
    return await fn({ client, begin, commit, rollback });
  } finally {
    await client.release();
  }
}

export const withinTransaction: WithinConnection = async (fn) => {
  return withinConnection(async ({ client, begin, commit, rollback }) => {
    try {
      await begin();
      const result = await fn({ client, begin, commit, rollback });
      await commit();
      return result;
    } catch (e) {
      await rollback();
      throw e;
    }
  })
}

export const withinRollbackTransaction: WithinConnection = async (fn) => {
  return withinConnection(async ({ client, begin, commit, rollback }) => {
    try {
      await begin();
      return await fn({
        client,
        begin,
        commit,
        rollback,
      });
    } finally {
      await rollback();
    }
  })
}

type WithinConnectionForTesting = (fn: (params: WithinConnection) => any) => () => any;
export const t: WithinConnectionForTesting = (fn) => async () => {
  return await withinConnection(async (params) => {
    try {
      await params.begin();
      return await fn(async (fn2) => fn2(params));
    } finally {
      await params.rollback();
    }
  });
}