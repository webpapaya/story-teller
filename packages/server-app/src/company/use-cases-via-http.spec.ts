import { AnyCommandDefinition, v } from '@story-teller/shared'
import { Request } from 'express'
import { assertThat, truthy } from 'hamjest'
import { InputInvalid } from '../errors'
import { AnyConnectedUseCaseConfig, AnyUseCaseConfigType, connectUseCase, useCase } from '../lib/use-case'

const useCaseViaHTTP = <
  CommandDefinition extends AnyCommandDefinition,
  UseCaseConfig extends AnyUseCaseConfigType,
  ConnectedUseCaseConfig extends AnyConnectedUseCaseConfig<UseCaseConfig>
>(config: {
  apiDefinition: CommandDefinition
  useCase: ConnectedUseCaseConfig
  mapToCommand: (input: CommandDefinition['validator']['O']) => ConnectedUseCaseConfig['useCase']['config']['command']['O']
}) => {
  return {
    useCaseConfig: config.useCase.useCase.config,
    mapRequestToCommand: (req: Pick<Request, 'body'>) => {
      const decoded = config.apiDefinition.validator.decode(req.body)
        .mapError((error) => { throw new InputInvalid(error) })
        .get()

      return config.mapToCommand(decoded)
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

  it('maps input correctly', () => {
    const httpUseCase = useCaseViaHTTP({
      apiDefinition,
      useCase: connectedUseCaseDefinition,
      mapToCommand: (payload) => {
        return { commandUseCase: payload.commandInput }
      }
    })

    const body = apiDefinition.validator.build()[0]()

    assertThat(httpUseCase.useCaseConfig.command.decode(
      httpUseCase.mapRequestToCommand({ body })).isOk(), truthy())
  })
})
