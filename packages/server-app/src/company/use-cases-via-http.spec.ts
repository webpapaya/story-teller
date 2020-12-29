import { AnyCommandDefinition, v } from '@story-teller/shared'
import { Request } from 'express'
import { assertThat, instanceOf, throws, truthy } from 'hamjest'
import { InputInvalid, ResponseInvalid } from '../errors'
import { AnyConnectedUseCaseConfig, AnyUseCaseConfigType, connectUseCase, useCase } from '../lib/use-case'

const useCaseViaHTTP = <
  CommandDefinition extends AnyCommandDefinition,
  UseCaseConfig extends AnyUseCaseConfigType,
  ConnectedUseCaseConfig extends AnyConnectedUseCaseConfig<UseCaseConfig>,
  Command extends ConnectedUseCaseConfig['useCase']['config']['command']['O'],
  Aggregate extends ConnectedUseCaseConfig['useCase']['config']['aggregateTo']['O'],
>(config: {
  apiDefinition: CommandDefinition
  useCase: ConnectedUseCaseConfig

  // TODO: add default implementation
  mapToCommand: (input: CommandDefinition['validator']['O']) => Command

  // TODO: add default implementation
  mapToResponse: (aggregate: Aggregate) => CommandDefinition['response']['O']
}) => {
  return {
    apiDefinitionValidator: config.apiDefinition.validator,
    apiDefinitionResponse: config.apiDefinition.response,

    useCaseConfig: config.useCase.useCase.config,
    mapRequestToCommand: (req: Pick<Request, 'body'>) => {
      const decoded = config.apiDefinition.validator.decode(req.body)
        .mapError((error) => { throw new InputInvalid(error) })
        .get()

      return config.mapToCommand(decoded)
    },
    mapAggregateToResponse: (aggregate: Aggregate) => {
      return config.apiDefinition.response.decode(config.mapToResponse(aggregate))
        .mapError((error) => { throw new ResponseInvalid(error) })
        .get()
    }
  }
}

describe('use-case-via-http', () => {
  const apiDefinition = {
    verb: 'post' as const,
    model: 'irrelevant',
    validator: v.record({ commandInput: v.string }),
    response: v.record({ aggregateOutput: v.string })
  }

  const useCaseDefinition = useCase({
    command: v.record({ commandUseCase: v.string }),
    aggregate: v.aggregate({ aggregate: v.string }),
    events: [],
    execute: ({ aggregate }) => {
      return aggregate
    }
  })

  const connectedUseCaseDefinition = connectUseCase({
    useCase: useCaseDefinition,
    mapCommand: () => undefined,
    fetchAggregate: async () => {
      return useCaseDefinition.config.aggregateFrom.build()[0]()
    },
    ensureAggregate: async () => {}
  })

  const httpUseCase = useCaseViaHTTP({
    apiDefinition,
    useCase: connectedUseCaseDefinition,
    mapToCommand: (payload) => {
      return { commandUseCase: payload.commandInput }
    },
    mapToResponse: (aggregate) => {
      return { aggregateOutput: aggregate.aggregate }
    }
  })

  describe('command mapping', () => {
    it('WHEN correct input given, maps it correctly', () => {
      httpUseCase.apiDefinitionValidator.build().forEach((factory) => {
        assertThat(httpUseCase.useCaseConfig.command.decode(
          httpUseCase.mapRequestToCommand({ body: factory() })).isOk(), truthy())
      })
    })

    it('WHEN invalid input given, throws InputInvalid error', () => {
      assertThat(() => httpUseCase.useCaseConfig.command.decode(
        httpUseCase.mapRequestToCommand({ body: 'test' })).isOk(), throws(instanceOf(InputInvalid)))
    })
  })

  describe('response mapping', () => {
    it('maps it correctly', () => {
      httpUseCase.useCaseConfig.aggregateTo.build().forEach((aggregateFactory) => {
        assertThat(httpUseCase.apiDefinitionResponse.decode(
          httpUseCase.mapAggregateToResponse(aggregateFactory())).isOk(), truthy())
      })
    })
  })
})
