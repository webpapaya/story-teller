import mockdate from 'mockdate'
// @ts-ignore
import { assertThat, equalTo } from 'hamjest'
import { WithinConnection, DBClient, withinConnection } from './lib/db'
import { PoolClient } from 'pg'

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
  client: DBClient
}) => any) => () => any;

export const t: WithinConnectionForTesting = (fn) => async () => {
  return withinConnection(async (params) => {
    try {
      await params.begin()
      return await fn({
        client: params.client,
        withinConnection: async (fn2) => fn2(params)
      })
    } finally {
      await params.rollback()
    }
  })
}

export const assertDifference = async (deps: { withinConnection: WithinConnection }, table: string, difference: number, fn: Function) => {
  return deps.withinConnection(async ({ client}) => {
    const before = await client.query(`select count(*) as count from ${table};`)
    await fn();
    const after = await client.query(`select count(*) as count from ${table};`)
    assertThat(parseInt(after.rows[0].count),
      equalTo(parseInt(before.rows[0].count) + difference));
  })
}