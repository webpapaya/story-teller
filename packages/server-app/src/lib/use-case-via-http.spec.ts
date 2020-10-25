import { v } from '@story-teller/shared'
import { aggregateFactory, connectUseCase, useCase } from './use-case'
import { exposeUseCaseViaHTTP } from './use-case-via-http'

describe('exposeUseCaseViaHTTP', () => {
  it('verify types for record', () => {
    const useCaseA = useCase({
      command: v.record({
        someProp: v.string
      }),
      aggregate: v.string,
      events: [],
      execute: () => 'test'
    })
    const connectedUseCaseA = connectUseCase({
      useCase: useCaseA,
      mapCommand: () => '',
      ensureAggregate: async (aggregate) => aggregate,
      fetchAggregate: async () => 'hallo'
    })

    exposeUseCaseViaHTTP({
      app: { post: () => {} },
      requestingUser: v.string,
      mapToCommand: () => 'command',
      mapToRequestingUser: () => 'requesting user',
      aggregateName: 'whatever',
      actionName: 'useCaseA',
      method: 'post',
      useCase: connectedUseCaseA,
      authenticate: () => true
    })
  })
})
