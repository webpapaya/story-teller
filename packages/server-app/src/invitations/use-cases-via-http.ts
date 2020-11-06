import * as useCases from './use-cases-connected'
import { exposeUseCaseViaHTTP } from '../lib/use-case-via-http'
import { IRouter, Request } from 'express'
import { mapToRequestingUser, requestingUser } from '../domain'


export const initialize = (app: IRouter) => {
  exposeUseCaseViaHTTP({
    app,
    actionName: 'invite',
    aggregateName: 'invitation',
    useCase: useCases.acceptInvitation,
    method: 'post',
    requestingUser,
    authenticate: () => true,
    mapToRequestingUser,
    mapToCommand: (requestingUser, request) => {
      return {
        ...request.body,
        requestingUser
      }
    }
  })

  exposeUseCaseViaHTTP({
    app,
    actionName: 'accept',
    aggregateName: 'invitation',
    useCase: useCases.acceptInvitation,
    method: 'post',
    requestingUser,
    authenticate: ({ requestingUser, aggregate }) => {
      return requestingUser?.id === aggregate.inviteeId
    },
    mapToRequestingUser,
    mapToCommand: (requestingUser, request) => {
      return {
        ...request.body,
        requestingUser
      }
    }
  })

  exposeUseCaseViaHTTP({
    app,
    actionName: 'reject',
    aggregateName: 'invitation',
    useCase: useCases.rejectInvitation,
    method: 'post',
    requestingUser,
    authenticate: ({ requestingUser, aggregate }) => {
      return requestingUser?.id === aggregate.inviteeId
    },
    mapToRequestingUser,
    mapToCommand: (requestingUser, request) => {
      return {
        ...request.body,
        requestingUser
      }
    }
  })

}
