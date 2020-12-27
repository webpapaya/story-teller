import * as useCases from './use-cases-connected'
import { convertError, exposeUseCaseViaHTTP } from '../lib/use-case-via-http'
import { IRouter, Response } from 'express'
import { v } from '@story-teller/shared'
import './use-cases-reactions'
import { AuthenticationToken } from './domain'

export const initialize = (app: IRouter) => {
  const setRefreshTokenCookie = (res: Response, refreshToken: AuthenticationToken) => {
    if (refreshToken.token.state === 'active') {
      const cookie = JSON.stringify({
        id: refreshToken.id,
        userId: refreshToken.userId,
        token: refreshToken.token.plainToken
      })

      res.cookie('refreshToken', cookie, {
        expires: new Date(refreshToken.expiresOn.toString()),
        httpOnly: true,
        signed: true
      })
    }
  }

  app.post('/authentication/sign-in', async (req, res) => {
    try {
      const signInResponse = await useCases.signIn.execute(req.body)
      setRefreshTokenCookie(res, signInResponse.refreshToken)
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

  app.post('/authentication/refresh-token', async (req, res) => {
    try {
      const refreshToken = JSON.parse(req.signedCookies.refreshToken)
      const refreshTokenResponse = await useCases.refreshToken.execute(refreshToken)
      setRefreshTokenCookie(res, refreshTokenResponse.refreshToken)

      res.send({
        payload: {
          jwtToken: refreshTokenResponse.jwtToken
        }
      })
    } catch (e) {
      const { status, body } = convertError(e)
      res.status(status)
      res.send(body)
    }
  })

  app.post('/authentication/sign-out', async (req, res) => {
    try {
      const refreshToken = JSON.parse(req.signedCookies.refreshToken)
      res.cookie('refreshToken', { expires: Date.now() })
      await useCases.signOut.execute(refreshToken)

      res.send({
        payload: {}
      })
    } catch (e) {
      console.log(e)
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
