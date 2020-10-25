import { AnyCodec } from "@story-teller/shared";
import { Request, Response } from "express";
import { AnyUseCaseConfigType, AnyConnectedUseCaseConfig, BeforeUseCase } from './use-case'

type HTTPVerb = 'get' | 'post' | 'patch' | 'delete' | 'put'
const httpRegistry: {
  method: HTTPVerb,
  aggregateName: string,
  actionName: string,
  authenticate: (payload: {
    requestingUser?: any,
    aggregate: any,
  }) => boolean,
  useCase: AnyConnectedUseCaseConfig<AnyUseCaseConfigType>
}[] = []

export const exposeUseCaseViaHTTP = <
  RequestingUser extends AnyCodec,
  UseCaseConfig extends AnyUseCaseConfigType,
  ConnectedUseCaseConfig extends AnyConnectedUseCaseConfig<UseCaseConfig>
>(config: {
  app: any,
  method: HTTPVerb,
  aggregateName: string,
  actionName: string,
  requestingUser: RequestingUser,
  mapToRequestingUser: (request: Request) => RequestingUser['O'],
  mapToCommand: (
    requestingUser: RequestingUser['O'],
    request: Request
  ) => UseCaseConfig['command']['O']
  authenticate: (payload: {
    requestingUser?: RequestingUser['O'],
    aggregate: Parameters<BeforeUseCase<UseCaseConfig>>[0]['aggregate'],
  }) => boolean,
  useCase: ConnectedUseCaseConfig,
}) => {
  const route = [config.aggregateName, config.actionName].join('/')
  httpRegistry.push({
    method: config.method,
    aggregateName: config.aggregateName,
    actionName: config.actionName,
    authenticate: config.authenticate,
    useCase: config.useCase as unknown as AnyConnectedUseCaseConfig<AnyUseCaseConfigType>,
  })

  config.app[config.method](
    route,
    async (req: Request, res: Response) => {
      const requestingUser = config.requestingUser.decode(config.mapToRequestingUser(req))
      if (!requestingUser.isOk()) {
        throw new Error('Unauthorized');
      }

      const [aggregateAfter] = await config.useCase.execute(
        config.mapToCommand(requestingUser, req), config.authenticate)

      const links = httpRegistry
        .filter(({ aggregateName }) => {
          return aggregateName === config.aggregateName
        })
        .filter(({ authenticate }) => {
          return authenticate({ requestingUser, aggregate: aggregateAfter })
        })
        .filter(({ useCase }) => {
          const precondition = useCase.useCase.config.preCondition
          return !precondition || precondition?.({ aggregate: aggregateAfter })
        })
        .map(({ actionName, aggregateName, method }) => ({
          route: [actionName, aggregateName].join('/'),
          actionName,
          aggregateName,
          method,
        }))

      return {
        links,
        payload: aggregateAfter,
      }
    })
}