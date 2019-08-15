import expect from 'expect'
import uuid from 'uuid'
import { createApp } from './lib'
import { t } from './lib/db'
import { ZonedDateTime } from 'js-joda'
import { reducers } from './reducers'

const toThrow = async (fn: () => Promise<unknown>) => {
  let error
  try {
    await fn()
  } catch (e) {
    error = e
  } finally {
    expect(error).toBeTruthy()
  }
}

describe('user', () => {
  it('create', t(async (withinConnection) => {
    const app = createApp({ withinConnection, reducers, queries: {} })
    await app.publish({ type: 'user/created', payload: { id: uuid(), name: 'Test' } })
    await withinConnection(async ({ client }) => {
      const result = await client.query(`select * from Users;`)
      expect(result.rows[0].name).toEqual('Test')
    })
  }))

  it('update', t(async (withinConnection) => {
    const app = createApp({ withinConnection, reducers, queries: {} })
    const id = uuid()
    await app.publish({ type: 'user/created', payload: { id, name: 'Test' } })
    await app.publish({ type: 'user/updated', payload: { id, name: 'Updated' } })
    await withinConnection(async ({ client }) => {
      const result = await client.query(`select * from Users;`)
      expect(result.rows[0].name).toEqual('Updated')
    })
  }))

  it('delete', t(async (withinConnection) => {
    const app = createApp({ withinConnection, reducers, queries: {} })
    const id = uuid()
    await app.publish({ type: 'user/created', payload: { id, name: 'Test' } })
    await app.publish({ type: 'user/deleted', payload: { id } })
    await withinConnection(async ({ client }) => {
      const result = await client.query(`select * from Users;`)
      expect(result.rows[0]).toEqual(undefined)
    })
  }))
})

describe('stamp', () => {
  it('create', t(async (withinConnection) => {
    const app = createApp({ withinConnection, reducers, queries: {} })
    await app.publish({ type: 'stamp/created',
      payload: {
        id: uuid(),
        timestamp: ZonedDateTime.parse('2000-01-01T01:00:10+10:00'),
        type: 'Start'
      } })

    await withinConnection(async ({ client }) => {
      const result = await client.query(`select * from Stamps;`)
      expect(result.rows.length).toEqual(1)
    })
  }))

  it.skip('replace event', t(async (withinConnection) => {
    const app = createApp({ withinConnection, reducers, queries: {} })
    const eventId = await app.publish({ type: 'stamp/created',
      payload: {
        id: uuid(),
        timestamp: ZonedDateTime.parse('2000-01-01T01:00:10+10:00'),
        type: 'Start',
        note: 'test'
      } })

    await app.replaceEvent(eventId, { id: uuid(), note: 'updated' })
    await withinConnection(async ({ client }) => {
      const result = await client.query(`select * from Stamps`)
      expect(result.rows[0].note).toEqual('updated')
    })
  }))

  it.skip('replaces multiple events', t(async (withinConnection) => {
    const app = createApp({ withinConnection, reducers, queries: {} })
    const eventId = await app.publish({ type: 'stamp/created',
      payload: {
        id: uuid(),
        timestamp: ZonedDateTime.parse('2000-01-01T01:00:10+10:00'),
        type: 'Start',
        note: 'test'
      } })

    const eventId1 = await app.replaceEvent(eventId, { note: '1' })
    const eventId2 = await app.replaceEvent(eventId1, { note: '2' })
    await app.replaceEvent(eventId2, { note: '3' })

    await withinConnection(async ({ client }) => {
      const result = await client.query(`select * from Stamps`)
      expect(result.rows[0].note).toEqual('3')
    })
  }))

  it('can not replace same event twice', t(async (withinConnection) => {
    const app = createApp({ withinConnection, reducers, queries: {} })
    const eventId = await app.publish({ type: 'stamp/created',
      payload: {
        id: uuid(),
        timestamp: ZonedDateTime.parse('2000-01-01T01:00:10+10:00'),
        type: 'Start',
        note: 'test'
      } })

    await toThrow(async () => {
      await app.replaceEvent(eventId, { note: 'updated' })
      await app.replaceEvent(eventId, { note: 'updated' })
    })
  }))
})

it.skip('rebuild aggregates', t(async (withinConnection) => {
  const app = createApp({ withinConnection, reducers, queries: {} })
  await app.publish({ type: 'user/created', payload: { id: uuid(), name: 'Test' } })
  await app.publish({ type: 'user/created', payload: { id: uuid(), name: 'Testt' } })
  await new Promise((resolve) => setTimeout(resolve, 1000))
  await app.rebuildAggregates()
  await withinConnection(async ({ client }) => {
    const result = await client.query(`select * from Users;`)
    console.log(result.rows)
    expect(result.rows.length).toEqual(2)
  })
}))
