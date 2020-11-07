import * as useCases from './use-cases-connected'
import { exposeUseCaseViaHTTP } from '../lib/use-case-via-http'
import { IRouter } from 'express'
import { mapToPrincipal, principal } from '../principal'

export const initialize = (app: IRouter) => {
  exposeUseCaseViaHTTP({
    app,
    actionName: '',
    aggregateName: 'company',
    useCase: useCases.addEmployee,
    method: 'post',
    principal,
    authenticateBefore: () => true,
    mapToPrincipal,
    mapToCommand: ({ principal, request }) => {
      return {
        ...request.body,
        principalId: principal.id
      }
    }
  })

  exposeUseCaseViaHTTP({
    app,
    actionName: 'addEmployee',
    aggregateName: 'company',
    useCase: useCases.addEmployee,
    method: 'put',
    principal,
    authenticateBefore: () => true,
    mapToPrincipal,
    mapToCommand: ({ principal, request }) => {
      return request.body
    }
  })

  exposeUseCaseViaHTTP({
    app,
    actionName: 'removeEmployee',
    aggregateName: 'company',
    useCase: useCases.removeEmployee,
    method: 'put',
    principal,
    authenticateBefore: () => true,
    mapToPrincipal,
    mapToCommand: ({ principal, request }) => {
      return request.body
    }
  })

  exposeUseCaseViaHTTP({
    app,
    actionName: 'rename',
    aggregateName: 'company',
    useCase: useCases.rename,
    method: 'put',
    principal,
    authenticateBefore: () => true,
    mapToPrincipal,
    mapToCommand: ({ principal, request }) => {
      return request.body
    }
  })

  exposeUseCaseViaHTTP({
    app,
    actionName: 'setEmployeeRole',
    aggregateName: 'company',
    useCase: useCases.setEmployeeRole,
    method: 'put',
    principal,
    authenticateBefore: () => true,
    mapToPrincipal,
    mapToCommand: ({ principal, request }) => {
      return request.body
    }
  })
}
