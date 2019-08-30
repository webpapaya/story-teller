import mockdate from 'mockdate'
import { WithinConnection, DBClient, withinConnection } from './lib/db'

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
