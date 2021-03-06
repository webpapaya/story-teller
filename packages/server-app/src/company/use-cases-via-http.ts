import * as useCases from './use-cases-connected'
import { mapToFastifyPrincipal, Principal } from '../authentication/map-to-principal'
import { principal } from '../authentication/domain'
import { queryViaHTTP, useCaseViaHTTP } from '../lib/http-adapter/use-case-via-http'
import { Company } from '@story-teller/shared'
import { v4 } from 'uuid'
import { CompanyAggregate } from './use-cases'

const identity = <T>(value: T) => value

const employedInCompany = ({ principal, aggregate: company }: { principal: Principal, aggregate: CompanyAggregate }) =>
  principal.employedIn.some((employment) => employment.companyId === company.id)

const managerInCompany = ({ principal, aggregate: company }: { principal: Principal, aggregate: CompanyAggregate }) => {
  return employedInCompany({ principal, aggregate: company }) &&
    principal.employedIn.some((employment) =>
      employment.companyId === company.id && employment.role === 'manager')
}

export const createCompany = useCaseViaHTTP({
  apiDefinition: Company.actions.createCompany,
  authorization: {
    principal: principal,
    mapToPrincipal: mapToFastifyPrincipal
  },
  mapToCommand: (httpInput, principal) => {
    return {
      id: v4(),
      principalId: principal.id,
      name: httpInput.name
    }
  },
  mapToResponse: identity,
  useCase: useCases.create
})

export const renameCompany = useCaseViaHTTP({
  apiDefinition: Company.actions.rename,
  authorization: {
    principal: principal,
    mapToPrincipal: mapToFastifyPrincipal
  },
  mapToCommand: identity,
  mapToResponse: identity,
  authenticateBefore: managerInCompany,
  useCase: useCases.rename
})

export const addEmployee = useCaseViaHTTP({
  apiDefinition: Company.actions.addEmployee,
  authorization: {
    principal: principal,
    mapToPrincipal: mapToFastifyPrincipal
  },
  mapToCommand: identity,
  mapToResponse: identity,
  authenticateBefore: managerInCompany,
  useCase: useCases.addEmployee
})

export const removeEmployee = useCaseViaHTTP({
  apiDefinition: Company.actions.removeEmployee,
  authorization: {
    principal: principal,
    mapToPrincipal: mapToFastifyPrincipal
  },
  mapToCommand: identity,
  mapToResponse: identity,
  authenticateBefore: managerInCompany,
  useCase: useCases.removeEmployee
})

export const setEmployeeRole = useCaseViaHTTP({
  apiDefinition: Company.actions.setEmployeeRole,
  authorization: {
    principal: principal,
    mapToPrincipal: mapToFastifyPrincipal
  },
  mapToCommand: (httpInput) => {
    return {
      ...httpInput,
      role: httpInput.role as CompanyAggregate['employees'][0]['role']
    }
  },
  mapToResponse: identity,
  authenticateBefore: managerInCompany,
  useCase: useCases.setEmployeeRole
})

export const whereCompanies = queryViaHTTP({
  apiDefinition: Company.queries.where,
  authorization: {
    principal: principal,
    mapToPrincipal: mapToFastifyPrincipal
  },
  mapToCommand: (_, principal) => {
    return { ids: principal.employedIn.map((employment) => employment.companyId) }
  },
  mapToResponse: identity,
  query: useCases.whereCompanies
})
