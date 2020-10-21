import { assertThat, equalTo, promiseThat, rejected } from 'hamjest'
import { useCase, connectUseCase, reactToEventSync, aggregateFactory } from './use-case'
import { v } from '@story-teller/shared'
import { buildEvent } from './events'
import sinon from 'ts-sinon'
import { t } from '../spec-helpers'

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

describe('connectUseCase', () => {
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
  const connectedUseCase = connectUseCase({
    useCase: someUseCase,
    mapCommand: (cmd) => cmd.id,
    fetchAggregate: (id: number) => Promise.resolve({
      id: id,
      number: Math.random(),
      otherProperty: 'hallo'
    }),
    ensureAggregate: () => Promise.resolve(void 0)
  })

  it('', t((externalDependencies) => {
    const event = buildEvent('test', v.record({
      someId: v.uuid
    }));

    reactToEventSync({
      event,
      useCase: connectedUseCase,
      mapper: (x) => ({
        id: parseInt(x.someId),
        value: 1
      })
    })
  }))
})

it('verifies types', () => {
  aggregateFactory({
    command: v.string,
    aggregateFrom: v.string,
    aggregateTo: v.string,
    events: [],
    // @ts-expect-error
    execute: ({ aggregate }) => {}
  })

  useCase({
    command: v.string,
    aggregate: v.string,
    events: [],
    // @ts-expect-error
    execute: ({ aggregate }) => {}
  })
})
