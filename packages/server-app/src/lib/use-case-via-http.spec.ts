import { v } from '@story-teller/shared'
import { IRouter } from 'express'
import { connectUseCase, useCase } from './use-case'
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
      mapToFetchArgs: () => '',
      ensureAggregate: async (aggregate) => aggregate,
      fetchAggregate: async () => 'hallo'
    })

    exposeUseCaseViaHTTP({
      app: { post: () => {} } as unknown as IRouter,
      principal: v.string,
      mapToCommand: () => 'command',
      mapToPrincipal: () => 'requesting user',
      aggregateName: 'whatever',
      actionName: 'useCaseA',
      method: 'post',
      useCase: connectedUseCaseA,
      authenticateBefore: () => true
    })
  })
})
