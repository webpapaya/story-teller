import * as useCases from './use-cases-connected'
import { convertError, exposeUseCaseViaHTTP } from '../lib/use-case-via-http'
import { IRouter } from 'express'
import { v } from '@story-teller/shared'
import './use-cases-reactions'

export const initialize = (app: IRouter) => {
  app.post('/authentication/sign-in', async (req, res) => {
    try {
      const signInResponse = await useCases.signIn.execute(req.body)
      if (signInResponse.refreshToken.token.state === 'active') {
        res.cookie('refreshToken', signInResponse.refreshToken.token.plainToken, {
          // TODO: enable expiration
          // expires: new Date(signInResponse.refreshToken.expiresOn.toString()),
          httpOnly: true,
          signed: true
        })
      }
      res.send({
        payload: {
          jwtToken: signInResponse.jwtToken
        }
      })
    } catch (e) {
      const { status, body } = convertError(e)
      res.status(status)
      res.send(body)
    }
  })

  exposeUseCaseViaHTTP({
    app,
    actionName: 'sign-up',
    aggregateName: 'authentication',
    useCase: useCases.register,
    method: 'post',
    principal: v.undefinedCodec,
    authenticateBefore: () => true,
    mapToPrincipal: () => undefined,
    mapToCommand: ({ request }) => {
      return request.body
    }
  })

  exposeUseCaseViaHTTP({
    app,
    actionName: 'request-password-reset',
    aggregateName: 'authentication',
    useCase: useCases.requestPasswordReset,
    method: 'post',
    principal: v.undefinedCodec,
    authenticateBefore: () => true,
    mapToPrincipal: () => undefined,
    mapToCommand: ({ request }) => {
      return request.body
    }
  })

  exposeUseCaseViaHTTP({
    app,
    actionName: 'reset-password',
    aggregateName: 'authentication',
    useCase: useCases.resetPasswordByToken,
    method: 'post',
    principal: v.undefinedCodec,
    authenticateBefore: () => true,
    mapToPrincipal: () => undefined,
    mapToCommand: ({ request }) => {
      return request.body
    }
  })

  return app
}
