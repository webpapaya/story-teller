import * as useCases from './use-cases-connected'
import { exposeUseCaseViaHTTP } from '../lib/use-case-via-http'
import { IRouter, Request } from 'express'
import { requestingUser } from '../domain'

const mapToRequestingUser = (request: Request) => {
  const decoded = requestingUser.decode(JSON.parse(request.headers.authorization ?? '{}'))
  if (decoded.isOk()) {
    return decoded.get()
  }
  throw new Error('unauthorized')
}

export const initialize = (app: IRouter) => {
  exposeUseCaseViaHTTP({
    app,
    actionName: 'request',
    aggregateName: 'vacation',
    useCase: useCases.requestVacation,
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
    aggregateName: 'vacation',
    actionName: 'deleteRequest',
    useCase: useCases.deleteRequest,
    method: 'put',
    requestingUser,
    authenticate: ({ requestingUser, aggregate }) => {
      return aggregate.employeeId === requestingUser?.id
    },
    mapToRequestingUser,
    mapToCommand: (requestingUser, request) => {
      return {
        ...JSON.parse(request.body),
        requestingUser
      }
    }
  })

  exposeUseCaseViaHTTP({
    app,
    aggregateName: 'vacation',
    actionName: 'confirmRequest',
    useCase: useCases.confirmRequest,
    method: 'put',
    requestingUser,
    authenticate: ({ requestingUser }) => {
      return requestingUser?.role === 'manager'
    },
    mapToRequestingUser,
    mapToCommand: (requestingUser, request) => {
      return {
        ...JSON.parse(request.body),
        requestingUser
      }
    }
  })

  exposeUseCaseViaHTTP({
    app,
    actionName: 'rejectRequest',
    aggregateName: 'vacation',
    useCase: useCases.rejectRequest,
    method: 'put',
    requestingUser,
    authenticate: ({ requestingUser }) => {
      return requestingUser?.role === 'manager'
    },
    mapToRequestingUser,
    mapToCommand: (requestingUser, request) => {
      return {
        ...JSON.parse(request.body),
        requestingUser
      }
    }
  })
}
