import { v } from '@story-teller/shared'
import { allOf, assertThat, equalTo, hasProperty, instanceOf, string, throws, truthy } from 'hamjest'
import { stub } from 'sinon'
import { v4 } from 'uuid'
import { InputInvalid, Unauthorized } from '../../errors'
import { connectUseCase, useCase } from '../use-case'

import fastify from 'fastify'
import { useCaseViaHTTP } from './use-case-via-http'

describe('use-case-via-http', () => {
  const principal = { id: v4() }
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
    authorization: {
      principal: v.record({
        id: v.string
      }),
      mapToPrincipal: (header) => ({
        id: header
      })
    },
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
          httpUseCase.mapRequestToCommand({ body: factory() }, principal)).isOk(), truthy())
      })
    })

    it('WHEN invalid input given, throws InputInvalid error', () => {
      assertThat(() => httpUseCase.useCaseConfig.command.decode(
        httpUseCase.mapRequestToCommand({ body: 'test' }, principal)).isOk(), throws(instanceOf(InputInvalid)))
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

  describe('principal mapping', () => {
    it('WHEN authorization header not given, throws Unauthorized', () => {
      assertThat(() => httpUseCase.mapRequestToPrincipal({ headers: {} }),
        throws(instanceOf(Unauthorized)))
    })

    it('WHEN authorization header could be mapped, returns principal', () => {
      const principal = { id: 'test' }
      assertThat(httpUseCase.mapRequestToPrincipal({ headers: { authorization: principal.id } }),
        equalTo(principal))
    })
  })

  it('WHEN authorization given, does not add principal to mapToCommand', () => {
    const mapToCommand = stub()
    const httpUseCase = useCaseViaHTTP({
      apiDefinition,
      useCase: connectedUseCaseDefinition,
      mapToCommand,
      authorization: {
        principal: v.record({
          id: v.string
        }),
        mapToPrincipal: (header) => ({
          id: header
        })
      },
      mapToResponse: (aggregate) => {
        return { aggregateOutput: aggregate.aggregate }
      }
    })
    const body = httpUseCase.apiDefinitionValidator.build()[0]()
    httpUseCase.mapRequestToCommand({ body }, principal)

    assertThat(mapToCommand, hasProperty('lastCall.args.length',
      equalTo(2)))
  })

  describe('HTTP Server', () => {
    const httpUseCase = useCaseViaHTTP({
      apiDefinition,
      useCase: connectedUseCaseDefinition,
      mapToCommand: (requestInput, principal) => {
        return { commandUseCase: principal.id }
      },
      authorization: {
        principal: v.record({
          id: v.string
        }),
        mapToPrincipal: (header) => ({
          id: header
        })
      },
      mapToResponse: (aggregate) => {
        return { aggregateOutput: aggregate.aggregate }
      }
    })

    describe('WHEN authorization required', () => {
      it('but none given, throws 401 Unauthorized', async () => {
        const app = fastify()
        httpUseCase.register(app)

        const response = await app.inject({
          method: httpUseCase.verb,
          url: httpUseCase.path
        })

        assertThat(response, hasProperty('statusCode', 401))
      })

      describe('AND valid token given and body given', () => {
        it('returns 200 ok', async () => {
          const app = fastify()
          httpUseCase.register(app)

          const response = await app.inject({
            method: httpUseCase.verb,
            url: httpUseCase.path,
            headers: {
              authorization: principal.id
            },
            payload: { commandInput: 'hallo' }
          })

          assertThat(response, hasProperty('statusCode', 200))
        })

        it('returns correct payload', async () => {
          const app = fastify()
          httpUseCase.register(app)

          const response = await app.inject({
            method: httpUseCase.verb,
            url: httpUseCase.path,
            headers: {
              authorization: principal.id
            },
            payload: { commandInput: 'hallo' }
          })

          assertThat(response.json(), allOf(
            hasProperty('payload.aggregateOutput', string()))
          )
        })

        async function callEndpoint ({ authenticateBefore, authenticateAfter }: {authenticateBefore: boolean, authenticateAfter: boolean}) {
          const httpUseCase = useCaseViaHTTP({
            apiDefinition,
            useCase: connectedUseCaseDefinition,
            mapToCommand: (requestInput, principal) => {
              return { commandUseCase: principal.id }
            },
            authorization: {
              principal: v.record({
                id: v.string
              }),
              mapToPrincipal: (header) => ({
                id: header
              })
            },
            authenticateBefore: () => authenticateBefore,
            authenticateAfter: () => authenticateAfter,
            mapToResponse: (aggregate) => {
              return { aggregateOutput: aggregate.aggregate }
            }
          })
          const app = fastify()
          httpUseCase.register(app)

          return app.inject({
            method: httpUseCase.verb,
            url: httpUseCase.path,
            headers: {
              authorization: principal.id
            },
            payload: { commandInput: 'hallo' }
          })
        }

        it('AND authenticateBefore returns false, returns 401', async () => {
          const response = await callEndpoint({
            authenticateBefore: false,
            authenticateAfter: true
          })

          assertThat(response,
            hasProperty('statusCode', 401))
        })

        it('AND authenticateAfter returns false, returns 401', async () => {
          const response = await callEndpoint({
            authenticateBefore: true,
            authenticateAfter: false
          })

          assertThat(response,
            hasProperty('statusCode', 401))
        })
      })
    })
  })
})
