import * as useCases from './use-cases-connected'
import { Authentication } from '@story-teller/shared'
import './use-cases-reactions'
import { AuthenticationToken } from './domain'
import { useCaseViaHTTP } from '../lib/http-adapter/use-case-via-http'
import { v4 } from 'uuid'
import { FastifyReply } from 'fastify'

const identity = <T>(value: T) => value

function setToken (reply: FastifyReply, refreshToken: AuthenticationToken) {
  if (refreshToken.token.state !== 'active') {
    return
  }

  const cookie = JSON.stringify({
    id: refreshToken.id,
    userId: refreshToken.userId,
    token: refreshToken.token.plainToken
  })

  reply.setCookie('refreshToken', cookie, {
    expires: new Date(refreshToken.expiresOn.toString()),
    httpOnly: true,
    signed: true
  })
}

export const signIn = useCaseViaHTTP({
  apiDefinition: Authentication.actions.signIn,
  mapToCommand: identity,
  mapToResponse: (aggregate) => ({ jwtToken: aggregate.jwtToken }),
  httpReplyOptions: ({ aggregate, reply }) => {
    setToken(reply, aggregate.refreshToken)
  },
  useCase: useCases.signIn
})

export const refreshToken = useCaseViaHTTP({
  apiDefinition: Authentication.actions.refreshToken,
  mapToCommand: (_input, _principal, req) =>
    JSON.parse(req.cookies.refreshToken),
  mapToResponse: (aggregate) => ({ jwtToken: aggregate.jwtToken }),
  httpReplyOptions: ({ aggregate, reply }) => {
    setToken(reply, aggregate.refreshToken)
  },
  useCase: useCases.refreshToken
})

export const signOut = useCaseViaHTTP({
  apiDefinition: Authentication.actions.signOut,
  mapToCommand: (_input, _principal, req) =>
    JSON.parse(req.cookies.refreshToken),
  mapToResponse: () => ({}),
  httpReplyOptions: ({ reply }) => {
    reply.clearCookie('refreshToken')
  },
  useCase: useCases.signOut
})

export const signUp = useCaseViaHTTP({
  apiDefinition: Authentication.actions.signUp,
  mapToCommand: ({ userIdentifier, password }) => ({ id: v4(), userIdentifier, password }),
  mapToResponse: identity,
  useCase: useCases.register
})

export const requestPasswordReset = useCaseViaHTTP({
  apiDefinition: Authentication.actions.requestPasswordReset,
  mapToCommand: identity,
  mapToResponse: identity,
  useCase: useCases.requestPasswordReset
})

export const resetPasswordByToken = useCaseViaHTTP({
  apiDefinition: Authentication.actions.resetPasswordByToken,
  mapToCommand: identity,
  mapToResponse: identity,
  useCase: useCases.resetPasswordByToken
})
