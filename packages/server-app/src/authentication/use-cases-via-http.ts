import * as useCases from './use-cases-connected'
import { exposeUseCaseViaHTTP } from '../lib/use-case-via-http'
import { IRouter } from 'express'
import { v } from '@story-teller/shared'

export const initialize = (app: IRouter) => {
  exposeUseCaseViaHTTP({
    app,
    actionName: 'sign-in',
    aggregateName: 'authentication',
    useCase: useCases.signIn,
    method: 'post',
    principal: v.undefinedCodec,
    authenticateBefore: () => true,
    mapToPrincipal: () => undefined,
    mapToCommand: ({ request }) => request.body
  })

  exposeUseCaseViaHTTP({
    app,
    actionName: 'register',
    aggregateName: 'authentication',
    useCase: useCases.register,
    method: 'post',
    principal: v.undefinedCodec,
    authenticateBefore: () => true,
    mapToPrincipal: () => undefined,
    mapToCommand: ({ request }) => request.body
  })
}
