import pg, { Pool, PoolClient } from 'pg'
// @ts-ignore
import pgCamelCase from 'pg-camelcase'
import { ZonedDateTime, LocalDate, LocalTime, ZoneOffset, LocalDateTime } from 'js-joda'
pgCamelCase.inject(pg)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

pg.types.setTypeParser(1082, (date) => {
  if (!date) { return null }
  return LocalDate.parse(date)
})

pg.types.setTypeParser(1184, (dateTimeAsString) => {
  if (!dateTimeAsString) { return null }
  const [date, timeWithZone] = dateTimeAsString.split(' ')
  return ZonedDateTime.of(
    LocalDate.parse(date),
    LocalTime.parse(timeWithZone.slice(0, 8)),
    ZoneOffset.UTC
  )
})

pg.types.setTypeParser(1114, (dateTimeAsString) => {
  if (!dateTimeAsString) { return null }
  const [date, timeWithZone] = dateTimeAsString.split(' ')
  return LocalDateTime.of(
    LocalDate.parse(date),
    LocalTime.parse(timeWithZone.slice(0, 8))
  )
})

export type DBClient = PoolClient;
export type WithinConnection = <T>(fn: (deps: TransactionParams) => T) => Promise<T>;

interface TransactionParams {
  client: DBClient
  begin: () => Promise<void>
  commit: () => Promise<void>
  rollback: () => Promise<void>
}

export const withinConnection: WithinConnection = async (fn) => {
  const client = await pool.connect()
  const begin = async () => { await client.query('BEGIN') }
  const commit = async () => { await client.query('COMMIT') }
  const rollback = async () => { await client.query('ROLLBACK') }
  try {
    return await fn({ client, begin, commit, rollback })
  } finally {
    await client.release()
  }
}

export const withinTransaction: WithinConnection = async (fn) => {
  return withinConnection(async ({ client, begin, commit, rollback }) => {
    try {
      await begin()
      const result = await fn({ client, begin, commit, rollback })
      await commit()
      return result
    } catch (e) {
      await rollback()
      throw e
    }
  })
}

export const withinRollbackTransaction: WithinConnection = async (fn) => {
  return withinConnection(async ({ client, begin, commit, rollback }) => {
    try {
      await begin()
      return await fn({
        client,
        begin,
        commit,
        rollback
      })
    } finally {
      await rollback()
    }
  })
}

type WithinNamespace = <T>(namespace: string, client: DBClient, fn: () => T) => Promise<T>;
export const withinNamespace: WithinNamespace = async (namespace, client, fn) => {
  const searchPath = (await client.query('show search_path')).rows[0].searchPath
  try {
    await client.query(`
      create schema ${namespace};
      SET search_path = ${namespace},${searchPath};
    `)
    return await fn()
  } finally {
    await client.query(`
      SET search_path = ${searchPath};
      drop schema if exists ${namespace};
    `)
  }
}

type WithinConnectionForTesting = (fn: (params: WithinConnection) => any) => () => any;
export const t: WithinConnectionForTesting = (fn) => async () => {
  return withinConnection(async (params) => {
    try {
      await params.begin()
      return await fn(async (fn2) => fn2(params))
    } finally {
      await params.rollback()
    }
  })
}
