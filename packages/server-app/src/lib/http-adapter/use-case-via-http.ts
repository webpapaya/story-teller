import { AnyCodec, AnyCommandDefinition } from '@story-teller/shared'
import { AnyConnectedUseCaseConfig, AnyUseCaseConfigType } from '../use-case'
import { httpRegistry } from './http-registry'
import { Request } from 'express'
import { InputInvalid, ResponseInvalid, Unauthorized } from '../../errors'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import 'fastify-cookie'
import { convertError } from './convert-to-http-errors'

export const useCaseViaHTTP = <Principal extends AnyCodec,
  CommandDefinition extends AnyCommandDefinition,
  UseCaseConfig extends AnyUseCaseConfigType,
  ConnectedUseCaseConfig extends AnyConnectedUseCaseConfig<UseCaseConfig>,
  Command extends ConnectedUseCaseConfig['useCase']['config']['command']['O'],
  Aggregate extends ConnectedUseCaseConfig['useCase']['config']['aggregateTo']['O'],
>(config: {
  apiDefinition: CommandDefinition
  useCase: ConnectedUseCaseConfig
  authorization?: {
    principal: Principal
    mapToPrincipal: (authorizationHeader: string) => Principal['O']
  }
  authenticateBefore?: (payload: {
    principal: Principal['O']
    aggregate: UseCaseConfig['aggregateFrom']['O']
  }) => boolean
  authenticateAfter?: (payload: {
    principal: Principal['O']
    aggregate: UseCaseConfig['aggregateTo']['O']
  }) => boolean

  mapToCommand: (
    input: CommandDefinition['validator']['O'],
    principal: Principal['O'],
    req: Pick<FastifyRequest, 'cookies' | 'headers'>
  ) => Command

  // TODO: add default implementation
  mapToResponse: (aggregate: Aggregate) => CommandDefinition['response']['O']
  httpReplyOptions?: (payload: { aggregate: Aggregate, reply: FastifyReply }) => void
}) => {
  const mapRequestToPrincipal = (req: Pick<Request, 'headers'>) => {
    if (req.headers.authorization) {
      return config.authorization?.mapToPrincipal(req.headers.authorization)
    }
    throw new Unauthorized()
  }

  const mapRequestToCommand = (req: Pick<FastifyRequest, 'body' | 'cookies' | 'headers'>, principal: Principal['A']) => {
    const decoded = config.apiDefinition.validator.decode(req.body)
      .mapError((error) => {
        throw new InputInvalid(error)
      })
      .get()

    return config.mapToCommand(decoded, principal, req)
  }

  const mapAggregateToResponse = (aggregate: Aggregate) => {
    return config.apiDefinition.response.decode(config.mapToResponse(aggregate))
      .mapError((error) => {
        throw new ResponseInvalid(error)
      })
      .get()
  }

  const path = '/' + [config.apiDefinition.model, config.apiDefinition.action]
    .filter((chunk) => Boolean(chunk))
    .join('/')

  const verb = config.apiDefinition.verb

  return {
    path,
    verb,

    apiDefinitionValidator: config.apiDefinition.validator,
    apiDefinitionResponse: config.apiDefinition.response,

    useCaseConfig: config.useCase.useCase.config,
    mapRequestToPrincipal,
    mapRequestToCommand,
    mapAggregateToResponse,
    register: (app: FastifyInstance) => {
      httpRegistry.add({
        method: config.apiDefinition.verb,
        aggregateName: config.apiDefinition.model,
        actionName: config.apiDefinition.verb,
        authenticateAfter: config.authenticateAfter ?? (() => true),
        authenticateBefore: config.authenticateBefore ?? (() => true),
        useCase: config.useCase as unknown as AnyConnectedUseCaseConfig<AnyUseCaseConfigType>
      })

      app[verb](path, async (req, reply) => {
        try {
          const principal = mapRequestToPrincipal(req)
          const command = mapRequestToCommand(req, principal)
          const aggregate = await config.useCase.execute(command, {
            beforeUseCase: ({ aggregate }) => config.authenticateBefore?.({
              principal,
              aggregate
            }) ?? true,
            afterUseCase: ({ aggregate }) => config.authenticateAfter?.({
              principal,
              aggregate
            }) ?? true
          })
          const responsePayload = mapAggregateToResponse(aggregate)

          config.httpReplyOptions?.({ reply, aggregate })

          reply.send({
            payload: responsePayload,
            links: httpRegistry.linksFor(config.apiDefinition.model, principal, aggregate)
          })
        } catch (e) {
          const { status, body } = convertError(e)
          reply.status(status)
          reply.send(body)
        }
      })
    }
  }
}
