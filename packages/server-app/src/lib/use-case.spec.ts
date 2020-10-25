import { assertThat, equalTo, promiseThat, rejected, hasProperty } from 'hamjest'
import { useCase, connectUseCase, reactToEventSync, aggregateFactory, reactToEventAsync } from './use-case'
import { v } from '@story-teller/shared'
import { buildEvent } from './events'
import sinon from 'ts-sinon'
import { t } from '../spec-helpers'
import uuid from 'uuid'
import { buildLazyPromise } from '../utils/build-lazy-promise'

const someUseCase = useCase({
  command: v.record({ id: v.number, value: v.number }),
  aggregate: v.record({ id: v.number, number: v.number, otherProperty: v.string }),
  events: [
    {
      event: buildEvent('someEvent', v.record({ hallo: v.string })),
      mapper: () => ({ hallo: 'test' })
    }
  ],
  execute: ({ command, aggregate }) => {
    return { ...aggregate, number: command.value }
  }
})

describe.skip('connectUseCase', () => {
  it('returns correct result for useCase', async () => {
    const connectedUseCase = connectUseCase({
      useCase: someUseCase,
      mapCommand: (cmd) => cmd.id,
      fetchAggregate: (id: number) => Promise.resolve({ id: id, number: Math.random(), otherProperty: 'hallo' }),
      ensureAggregate: () => Promise.resolve(void 0)
    })

    assertThat(await connectedUseCase.execute({ id: 1, value: 12 }),
      equalTo({ id: 1, number: 12, otherProperty: 'hallo' }))
  })

  describe('syncEvents', () => {
    const useCaseSpy = sinon.spy()
    const anotherUseCase = connectUseCase({
      useCase: useCase({
        command: v.record({ hallo: v.number }),
        aggregate: v.record({ number: v.number }),
        events: [],
        execute: ({ command }) => {
          useCaseSpy()
          return { number: command.hallo }
        }

      }),
      mapCommand: () => undefined,
      fetchAggregate: () => Promise.resolve({ number: 1 }),
      ensureAggregate: () => Promise.resolve(void 0)
    })

    it('calls synced useCase', async () => {
      const connectedUseCase = connectUseCase({
        getSyncedSubscriptions: () => ({
          someEvent: {
            eventPayload: v.record({ hallo: v.string }),
            listeners: [{
              useCase: anotherUseCase,
              mapper: (event: any) => ({ hallo: event.hallo.length })
            } as any]
          }
        }),
        useCase: someUseCase,
        mapCommand: (cmd) => cmd.id,
        fetchAggregate: (id: number) => Promise.resolve({ id: id, number: Math.random(), otherProperty: 'hallo' }),
        ensureAggregate: () => Promise.resolve(void 0)
      })

      useCaseSpy.resetHistory()
      await connectedUseCase.execute({ id: 1, value: 12 })
      assertThat(useCaseSpy.calledOnce, equalTo(true))
    })

    it('WHEN event with wrong payload is sent, throws', async () => {
      const connectedUseCase = connectUseCase({
        getSyncedSubscriptions: () => ({
          someEvent: {
            eventPayload: v.record({ hallo: v.string }),
            listeners: [anotherUseCase as any]
          }
        }),
        useCase: someUseCase,
        mapCommand: (cmd) => cmd.id,
        fetchAggregate: (id: number) => Promise.resolve({ id: id, number: Math.random(), otherProperty: 'hallo' }),
        ensureAggregate: () => Promise.resolve(void 0)
      })

      return promiseThat(connectedUseCase.execute({ id: 1, value: 12 }), rejected())
    })
  })
})

describe('reactToUseCaseSync', () => {
  it('calls synced event', async () => {
    const useCaseSpy = sinon.spy()
    const event = buildEvent('test', v.record({
      someId: v.uuid
    }))

    const useCaseA = useCase({
      command: v.string,
      aggregate: v.string,
      events: [],
      execute: ({ aggregate }) => {
        useCaseSpy()
        return aggregate
      }
    })

    const connectedUseCaseA = connectUseCase({
      useCase: useCaseA,
      fetchAggregate: async () => 'test1231',
      ensureAggregate: async () => 'string',
      mapCommand: () => 'string'
    })

    const useCaseB = useCase({
      command: v.string,
      aggregate: v.string,
      events: [{
        event,
        mapper: () => ({ someId: uuid() })
      }],
      execute: ({ aggregate }) => aggregate
    })

    const connectedUseCaseB = connectUseCase({
      useCase: useCaseB,
      fetchAggregate: async () => 'test1',
      ensureAggregate: async () => 'string',
      mapCommand: () => 'string'
    })

    reactToEventSync({
      event: buildEvent('test', v.record({
        someId: v.uuid
      })),
      useCase: connectedUseCaseA,
      mapper: () => ''
    })

    await connectedUseCaseB.execute('test')
    assertThat(useCaseSpy, hasProperty('callCount', 1))
  })

  it.skip('calls async event', t(async ({ channel }) => {
    const { resolve, promise } = buildLazyPromise()
    const event = buildEvent('test', v.record({
      someId: v.uuid
    }))

    const useCaseA = useCase({
      command: v.string,
      aggregate: v.string,
      events: [],
      execute: ({ aggregate }) => {
        resolve()
        return aggregate
      }
    })

    const connectedUseCaseA = connectUseCase({
      useCase: useCaseA,
      fetchAggregate: async () => 'test1231',
      ensureAggregate: async () => 'string',
      mapCommand: () => 'string'
    })

    const useCaseB = useCase({
      command: v.string,
      aggregate: v.string,
      events: [{
        event,
        mapper: () => ({ someId: uuid() })
      }],
      execute: ({ aggregate }) => aggregate
    })

    const connectedUseCaseB = connectUseCase({
      useCase: useCaseB,
      fetchAggregate: async () => 'test1',
      ensureAggregate: async () => 'string',
      mapCommand: () => 'string'
    })

    await reactToEventAsync({
      event: buildEvent('test', v.record({
        someId: v.uuid
      })),
      useCase: connectedUseCaseA,
      mapper: () => '',
      channel
    })

    connectedUseCaseB.execute('test')

    await promise
  }))
})

it.skip('verifies types', () => {
  aggregateFactory({
    command: v.string,
    aggregateFrom: v.string,
    aggregateTo: v.string,
    events: [],
    // @ts-expect-error
    execute: ({ aggregate }) => {} // eslint-disable-line @typescript-eslint/no-unused-vars
  })

  useCase({
    command: v.string,
    aggregate: v.string,
    events: [],
    // @ts-expect-error
    execute: ({ aggregate }) => {} // eslint-disable-line @typescript-eslint/no-unused-vars
  })

  const useCaseA = useCase({
    command: v.string,
    aggregate: v.string,
    events: [],
    execute: ({ aggregate }) => aggregate // eslint-disable-line @typescript-eslint/no-unused-vars
  })
  const connectedUseCaseA = connectUseCase({
    useCase: useCaseA,
    fetchAggregate: async () => 'test',
    ensureAggregate: async () => 'string',
    mapCommand: () => 'string'
  })

  connectUseCase({
    useCase: useCaseA,
    // @ts-expect-error
    fetchAggregate: async () => 1,
    ensureAggregate: async () => 'string',
    mapCommand: () => 'string'
  })

  connectUseCase({
    useCase: useCaseA,
    // eslint-ignore-next-line @typescript-eslint/no-unused-vars
    fetchAggregate: async (test: string) => 'string',
    ensureAggregate: async () => 'string',
    // @ts-expect-error
    mapCommand: () => 1
  })

  const event = buildEvent('test', v.record({
    someId: v.uuid
  }))

  reactToEventSync({
    event,
    useCase: connectedUseCaseA,
    mapper: () => ''
  })

  reactToEventSync({
    event,
    useCase: connectedUseCaseA,
    // @ts-expect-error
    mapper: () => 1
  })
})
