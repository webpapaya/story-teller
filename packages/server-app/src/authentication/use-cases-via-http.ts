import * as useCases from './use-cases-connected'
import { IRouter, Response } from 'express'
import { Authentication } from '@story-teller/shared'
import './use-cases-reactions'
import { AuthenticationToken } from './domain'
import { convertError } from '../lib/http-adapter/convert-to-http-errors'
import { useCaseViaHTTP } from '../lib/http-adapter/use-case-via-http'
import { v4 } from 'uuid'

const identity = <T>(value: T) => value

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

  useCaseViaHTTP({
    apiDefinition: Authentication.actions.signUp,
    mapToCommand: ({ userIdentifier, password }) => ({ id: v4(), userIdentifier, password }),
    mapToResponse: identity,
    useCase: useCases.register
  })

  useCaseViaHTTP({
    apiDefinition: Authentication.actions.requestPasswordReset,
    mapToCommand: identity,
    mapToResponse: identity,
    useCase: useCases.requestPasswordReset
  })

  useCaseViaHTTP({
    apiDefinition: Authentication.actions.resetPasswordByToken,
    mapToCommand: identity,
    mapToResponse: identity,
    useCase: useCases.resetPasswordByToken
  })

  return app
}
