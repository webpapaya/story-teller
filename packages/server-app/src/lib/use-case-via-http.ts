import { AnyCodec } from '@story-teller/shared'
import { IRouter, Request, Response } from 'express'
import { AnyUseCaseConfigType, AnyConnectedUseCaseConfig, BeforeUseCase } from './use-case'

type HTTPVerb = 'get' | 'post' | 'patch' | 'delete' | 'put'
const httpRegistry: Array<{
  method: HTTPVerb
  aggregateName: string
  actionName: string
  authenticate: (payload: {
    requestingUser?: any
    aggregate: any
  }) => boolean
  useCase: AnyConnectedUseCaseConfig<AnyUseCaseConfigType>
}> = []

export const exposeUseCaseViaHTTP = <
  RequestingUser extends AnyCodec,
  UseCaseConfig extends AnyUseCaseConfigType,
  ConnectedUseCaseConfig extends AnyConnectedUseCaseConfig<UseCaseConfig>
>(config: {
  app: IRouter
  method: HTTPVerb
  aggregateName: string
  actionName: string
  requestingUser: RequestingUser
  mapToRequestingUser: (request: Request) => RequestingUser['O']
  mapToCommand: (
    requestingUser: RequestingUser['O'],
    request: Request
  ) => UseCaseConfig['command']['O']
  authenticate: (payload: {
    requestingUser?: RequestingUser['O']
    aggregate: UseCaseConfig['aggregateFrom']['O']
  }) => boolean
  useCase: ConnectedUseCaseConfig
}) => {
  const route = '/' + [config.aggregateName, config.actionName].join('/')
  httpRegistry.push({
    method: config.method,
    aggregateName: config.aggregateName,
    actionName: config.actionName,
    authenticate: config.authenticate,
    useCase: config.useCase as unknown as AnyConnectedUseCaseConfig<AnyUseCaseConfigType>
  })

  config.app[config.method](
    route,
    async (req: Request, res: Response) => {
      const requestingUserResult = config.requestingUser.decode(config.mapToRequestingUser(req))
      if (!requestingUserResult.isOk()) {
        throw new Error('Unauthorized')
      }
      const requestingUser = requestingUserResult.get()

      const aggregateAfter = await config.useCase.execute(
        config.mapToCommand(requestingUser, req), config.authenticate)

      const links = httpRegistry
        .filter(({ aggregateName, method }) => {
          return aggregateName === config.aggregateName && method !== 'post'
        })
        .filter(({ authenticate }) => {
          return authenticate({ requestingUser, aggregate: aggregateAfter })
        })
        .filter(({ useCase }) => {
          const precondition = useCase.useCase.config.preCondition
          return !precondition || precondition?.({ aggregate: aggregateAfter })
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
