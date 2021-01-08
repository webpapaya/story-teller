import * as useCases from './use-cases-connected'
import { mapToFastifyPrincipal } from '../authentication/map-to-principal'
import { principal } from '../authentication/domain'
import { useCaseViaHTTP } from '../lib/http-adapter/use-case-via-http'
import { Company } from '@story-teller/shared'
import { v4 } from 'uuid'

const identity = <T>(value: T) => value

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

// export const initialize = (app: IRouter) => {
//   exposeUseCaseViaHTTP({
//     app,
//     actionName: '',
//     aggregateName: 'company',
//     useCase: useCases.create,
//     method: 'post',
//     principal,
//     authenticateBefore: () => true,
//     mapToPrincipal,
//     mapToCommand: ({ principal, request }) => {
//       return {
//         ...request.body,
//         principalId: principal.id
//       }
//     }
//   })
//
//   exposeUseCaseViaHTTP({
//     app,
//     actionName: 'addEmployee',
//     aggregateName: 'company',
//     method: 'put',
//
//     useCase: useCases.addEmployee,
//     principal,
//     authenticateBefore: () => true,
//     mapToPrincipal,
//     mapToCommand: ({ principal, request }) => {
//       return request.body
//     }
//   })
//
//   exposeUseCaseViaHTTP({
//     app,
//     actionName: 'removeEmployee',
//     aggregateName: 'company',
//     useCase: useCases.removeEmployee,
//     method: 'put',
//     principal,
//     authenticateBefore: () => true,
//     mapToPrincipal,
//     mapToCommand: ({ principal, request }) => {
//       return request.body
//     }
//   })
//
//   exposeUseCaseViaHTTP({
//     app,
//     actionName: 'rename',
//     aggregateName: 'company',
//     useCase: useCases.rename,
//     method: 'put',
//     principal,
//     authenticateBefore: ({ principal, aggregate: company }) =>
//       principal.employedIn.some((employment) => employment.companyId === company.id),
//     mapToPrincipal,
//     mapToCommand: ({ principal, request }) => {
//       return request.body
//     }
//   })
//
//   exposeUseCaseViaHTTP({
//     app,
//     actionName: 'setEmployeeRole',
//     aggregateName: 'company',
//     useCase: useCases.setEmployeeRole,
//     method: 'put',
//     principal,
//     authenticateBefore: () => true,
//     mapToPrincipal,
//     mapToCommand: ({ principal, request }) => {
//       return request.body
//     }
//   })
// }
