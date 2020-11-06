import * as useCases from './use-cases-connected'
import { exposeUseCaseViaHTTP } from '../lib/use-case-via-http'
import { IRouter, Request } from 'express'
import { principal } from '../domain'

const mapToPrincipal = (request: Request) => {
  const decoded = principal.decode(JSON.parse(request.headers.authorization ?? '{}'))
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
    principal,
    authenticate: () => true,
    mapToPrincipal,
    mapToCommand: (principal, request) => {
      return {
        ...request.body,
        principal
      }
    }
  })

  exposeUseCaseViaHTTP({
    app,
    aggregateName: 'vacation',
    actionName: 'deleteRequest',
    useCase: useCases.deleteRequest,
    method: 'put',
    principal,
    authenticate: ({ principal, aggregate }) => {
      return aggregate.employeeId === principal?.id
    },
    mapToPrincipal,
    mapToCommand: (principal, request) => {
      return {
        ...JSON.parse(request.body),
        principal
      }
    }
  })

  exposeUseCaseViaHTTP({
    app,
    aggregateName: 'vacation',
    actionName: 'confirmRequest',
    useCase: useCases.confirmRequest,
    method: 'put',
    principal,
    authenticate: ({ principal }) => {
      return principal?.role === 'manager'
    },
    mapToPrincipal,
    mapToCommand: (principal, request) => {
      return {
        ...JSON.parse(request.body),
        principal
      }
    }
  })

  exposeUseCaseViaHTTP({
    app,
    actionName: 'rejectRequest',
    aggregateName: 'vacation',
    useCase: useCases.rejectRequest,
    method: 'put',
    principal,
    authenticate: ({ principal }) => {
      return principal?.role === 'manager'
    },
    mapToPrincipal,
    mapToCommand: (principal, request) => {
      return {
        ...JSON.parse(request.body),
        principal
      }
    }
  })
}
