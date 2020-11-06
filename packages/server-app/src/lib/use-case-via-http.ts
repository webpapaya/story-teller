import { AnyCodec } from '@story-teller/shared'
import { IRouter, Request, Response } from 'express'
import { AnyUseCaseConfigType, AnyConnectedUseCaseConfig } from './use-case'

type HTTPVerb = 'get' | 'post' | 'patch' | 'delete' | 'put'
const httpRegistry: Array<{
  method: HTTPVerb
  aggregateName: string
  actionName: string
  authenticateBefore: (payload: {
    principal: any
    aggregate: any
  }) => boolean
  authenticateAfter: (payload: {
    principal: any
    aggregate: any
  }) => boolean
  useCase: AnyConnectedUseCaseConfig<AnyUseCaseConfigType>
}> = []

export const exposeUseCaseViaHTTP = <
  Principal extends AnyCodec,
  UseCaseConfig extends AnyUseCaseConfigType,
  ConnectedUseCaseConfig extends AnyConnectedUseCaseConfig<UseCaseConfig>
>(config: {
  app: IRouter
  method: HTTPVerb
  aggregateName: string
  actionName: string
  principal: Principal
  mapToPrincipal: (request: Request) => Principal['O']
  mapToCommand: (payload: {
    principal: Principal['O']
    request: Request
  }) => UseCaseConfig['command']['O']
  authenticateBefore?: (payload: {
    principal: Principal['O']
    aggregate: UseCaseConfig['aggregateFrom']['O']
  }) => boolean
  authenticateAfter?: (payload: {
    principal: Principal['O']
    aggregate: UseCaseConfig['aggregateTo']['O']
  }) => boolean
  useCase: ConnectedUseCaseConfig
}) => {
  const route = '/' + [config.aggregateName, config.actionName].join('/')
  httpRegistry.push({
    method: config.method,
    aggregateName: config.aggregateName,
    actionName: config.actionName,
    authenticateBefore: config.authenticateBefore ?? (() => true),
    authenticateAfter: config.authenticateAfter ?? (() => true),
    useCase: config.useCase as unknown as AnyConnectedUseCaseConfig<AnyUseCaseConfigType>
  })

  config.app[config.method](
    route,
    async (req: Request, res: Response) => {
      const principalResult = config.principal.decode(config.mapToPrincipal(req))
      if (!principalResult.isOk()) {
        throw new Error('Unauthorized')
      }
      const principal = principalResult.get()

      const aggregateAfter = await config.useCase.execute(
        config.mapToCommand({ principal, request: req }), {
          beforeUseCase: ({ aggregate }) => config.authenticateBefore?.({
            principal,
            aggregate
          }) ?? true,
          afterUseCase: ({ aggregate }) => config.authenticateAfter?.({
            principal,
            aggregate
          }) ?? true
        })

      const links = httpRegistry
        .filter(({ aggregateName, method }) => {
          return aggregateName === config.aggregateName && method !== 'post'
        })
        .filter(({ authenticateBefore }) => {
          return authenticateBefore({ principal, aggregate: aggregateAfter })
        })
        .filter(({ useCase }) => {
          const precondition = useCase.useCase.config.preCondition
          return !precondition ?? precondition?.({ aggregate: aggregateAfter })
        })
        .map(({ actionName, aggregateName, method, useCase }) => ({
          route: '/' + [aggregateName, actionName].join('/'),
          actionName,
          aggregateName,
          method,
          schema: useCase.useCase.config.command
        }))

      return res.send({
        links,
        payload: aggregateAfter
      })
    })
}
