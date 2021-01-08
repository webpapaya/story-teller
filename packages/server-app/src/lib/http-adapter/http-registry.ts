import { AnyConnectedUseCaseConfig, AnyUseCaseConfigType } from '../use-case'

type HTTPVerb = 'get' | 'post' | 'patch' | 'delete' | 'put'

interface HTTPRegistryItem {
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
}

const buildRegistry = () => {
  const httpRegistry: HTTPRegistryItem[] = []

  function linksFor<Principal, Aggregate> (aggregateName: string, principal: Principal, aggregate: Aggregate, method: HTTPVerb) {
    return httpRegistry
      .filter(({ aggregateName: currentAggregateName, method }) => {
        return currentAggregateName === aggregateName && method !== 'post'
      })
      .filter(({ authenticateBefore }) => {
        return method === 'post' || authenticateBefore({ principal, aggregate })
      })
      .filter(({ useCase }) => {
        const precondition = useCase.useCase.config.preCondition
        return !precondition ?? precondition?.({ aggregate })
      })
      .map(({ actionName, aggregateName, method, useCase }) => ({
        route: '/' + [aggregateName, actionName].join('/'),
        actionName,
        aggregateName,
        method,
        schema: useCase.useCase.config.command
      }))
  }

  function add (item: HTTPRegistryItem) {
    httpRegistry.push(item)
  }

  return { linksFor, add }
}
export const httpRegistry = buildRegistry()
