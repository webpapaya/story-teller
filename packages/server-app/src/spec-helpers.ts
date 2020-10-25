import mockdate from 'mockdate'
// @ts-ignore
import { assertThat, equalTo } from 'hamjest'
import { WithinConnection, DBClient, withinConnection } from './lib/db'
import { PoolClient } from 'pg'
import { Channel } from 'amqplib'
import { connectionPromise } from './lib/queue'

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
  pgClient: DBClient
  channel: Channel
}) => any) => () => any;

export const t: WithinConnectionForTesting = (fn) => async () => {
  return withinConnection(async (params) => {
    const queue = await connectionPromise
    const channel = await queue.createChannel()
    try {
      await params.begin()
      return await fn({
        pgClient: params.client,
        channel,
        withinConnection: async (fn2) => fn2(params)
      })
    } finally {
      await channel.close()
      await params.rollback()
    }
  })
}

export const assertDifference = async (deps: { pgClient: PoolClient }, table: string, difference: number, fn: Function) => {
  const before = await deps.pgClient.query(`select count(*) as count from ${table};`)
  await fn()
  const after = await deps.pgClient.query(`select count(*) as count from ${table};`)
  assertThat(parseInt(after.rows[0].count),
    equalTo(parseInt(before.rows[0].count) + difference))
}
