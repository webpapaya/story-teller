import { assertThat, equalTo, promiseThat, rejected } from 'hamjest'
import { useCase, connectUseCase } from './use-case'
import { v } from '@story-teller/shared'
import { buildEvent } from './events'
import sinon from 'ts-sinon'

describe('connectUseCase', () => {
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
            event: { name: 'someEvent', payload: { hallo: 1 } },
            useCases: [anotherUseCase]
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
            event: { name: 'someEvent', payload: { hallo: 'test' } },
            useCases: [anotherUseCase]
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
