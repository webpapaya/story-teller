
import pg, { Pool, PoolClient } from 'pg'
// @ts-expect-error
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

const installQueryLogger = () => {
  const Query = pg.Query
  const actualSubmit = Query.prototype.submit

  Query.prototype.submit = function () {
    // @ts-expect-error
    console.log({ query: this.text })
    // @ts-expect-error
    actualSubmit.apply(this, arguments)
  }
}

if (process.env.PG_LOG_QUERIES) {
  installQueryLogger()
}

export type DBClient = PoolClient
export type WithinConnection = <T>(fn: (deps: TransactionParams) => T) => Promise<T>

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
    return fn({ client, begin, commit, rollback })
  } finally {
    await client.release()
  }
}

export const withinTransaction: WithinConnection = async (fn) => {
  return await withinConnection(async ({ client, begin, commit, rollback }) => {
    try {
      await begin()
      const result = await fn({
        client,
        begin,
        commit,
        rollback
      })
      await commit()
      return result
    } catch (e) {
      await rollback()
      throw e
    }
  })
}

export const withinRollbackTransaction: WithinConnection = async (fn) => {
  return await withinConnection(async ({ client, begin, commit, rollback }) => {
    try {
      await begin()
      return fn({
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
