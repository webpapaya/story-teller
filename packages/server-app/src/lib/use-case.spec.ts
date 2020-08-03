import { assertThat, equalTo } from 'hamjest'
import { useCase, connectUseCase } from './use-case'
import { v } from '@story-teller/shared'
import { buildEvent } from './events'

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
})
