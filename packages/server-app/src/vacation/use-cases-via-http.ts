import * as useCases from './use-cases-connected'
import { exposeUseCaseViaHTTP } from '../lib/use-case-via-http'
import { IRouter } from 'express'
import { mapToPrincipal } from '../authentication/map-to-principal'
import { principal, Principal } from '../authentication/domain'
import { Vacation } from './use-cases'

export const initialize = (app: IRouter) => {
  const isEmployeeInCompany = (payload: {principal?: Principal, aggregate: Vacation }) => {
    return Boolean(payload.principal?.employedIn.some((employee) => {
      return employee.companyId === payload.aggregate.companyId
    }))
  }

  const canManageVacation = (payload: {principal: Principal, aggregate: Vacation }) => {
    return isEmployeeInCompany(payload) &&
      payload.principal?.employedIn.some((employee) => {
        return employee.companyId === payload.aggregate.companyId &&
          employee.role === 'manager'
      })
  }

  exposeUseCaseViaHTTP({
    app,
    actionName: 'request',
    aggregateName: 'vacation',
    useCase: useCases.requestVacation,
    method: 'post',
    principal,
    authenticateAfter: isEmployeeInCompany,
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
    aggregateName: 'vacation',
    actionName: 'deleteRequest',
    useCase: useCases.deleteRequest,
    method: 'put',
    principal,
    authenticateBefore: ({ principal, aggregate }) => {
      return aggregate.employeeId === principal.id
    },
    mapToPrincipal,
    mapToCommand: ({ principal, request }) => {
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
    authenticateBefore: canManageVacation,
    mapToPrincipal,
    mapToCommand: ({ principal, request }) => {
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
    authenticateBefore: canManageVacation,
    mapToPrincipal,
    mapToCommand: ({ principal, request }) => {
      return {
        ...JSON.parse(request.body),
        principal
      }
    }
  })
}
