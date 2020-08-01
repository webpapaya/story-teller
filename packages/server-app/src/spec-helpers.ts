import mockdate from 'mockdate'
// @ts-ignore
import { assertThat, equalTo } from 'hamjest'
import { WithinConnection, DBClient, withinConnection } from './lib/db'
import { PoolClient } from 'pg'
import { queue } from './lib/queue'
import PgBoss from 'pg-boss'

export const withMockedDate = async <T>(date: string, fn: (remock: typeof mockdate.set) => T) => {
  try {
    mockdate.set(date)
    return await fn(mockdate.set)
  } finally {
    mockdate.reset()
  }
}

type WithinConnectionForTesting = (fn: (params: {
  withinConnection: WithinConnection
  client: DBClient,
  queue: PgBoss,
}) => any) => () => any;

export const t: WithinConnectionForTesting = (fn) => async () => {
  return withinConnection(async (params) => {
    try {
      await params.begin()
      await queue.start()
      return await fn({
        client: params.client,
        queue,
        withinConnection: async (fn2) => fn2(params)
      })
    } finally {
      await queue.clearStorage()
      await params.rollback()
    }
  })
}

export const assertDifference = async (deps: { client: PoolClient }, table: string, difference: number, fn: Function) => {
  const before = await deps.client.query(`select count(*) as count from ${table};`)
  await fn()
  const after = await deps.client.query(`select count(*) as count from ${table};`)
  assertThat(parseInt(after.rows[0].count),
    equalTo(parseInt(before.rows[0].count) + difference))
}
