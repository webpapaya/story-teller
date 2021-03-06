import * as useCases from './use-cases-connected'
import { exposeUseCaseViaHTTP } from '../lib/use-case-via-http'
import { IRouter } from 'express'
import { mapToPrincipal, principal } from '../authentication/map-to-principal'

export const initialize = (app: IRouter) => {
  exposeUseCaseViaHTTP({
    app,
    actionName: 'invite',
    aggregateName: 'invitation',
    useCase: useCases.acceptInvitation,
    method: 'post',
    principal,
    authenticateBefore: () => true,
    mapToPrincipal,
    mapToCommand: ({ principal, request }) => {
      return {
        ...request.body,
        principal
      }
    }
  })

  exposeUseCaseViaHTTP({
    app,
    actionName: 'accept',
    aggregateName: 'invitation',
    useCase: useCases.acceptInvitation,
    method: 'put',
    principal,
    authenticateBefore: ({ principal, aggregate }) => {
      return principal?.id === aggregate.inviteeId
    },
    mapToPrincipal,
    mapToCommand: ({ principal, request }) => {
      return {
        ...request.body,
        principal
      }
    }
  })

  exposeUseCaseViaHTTP({
    app,
    actionName: 'reject',
    aggregateName: 'invitation',
    useCase: useCases.rejectInvitation,
    method: 'put',
    principal,
    authenticateBefore: ({ principal, aggregate }) => {
      return principal?.id === aggregate.inviteeId
    },
    mapToPrincipal,
    mapToCommand: ({ principal, request }) => {
      return {
        ...request.body,
        principal
      }
    }
  })
}
