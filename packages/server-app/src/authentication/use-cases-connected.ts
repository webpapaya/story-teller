import * as useCases from './use-cases'
import * as userAuthenticationRepo from './user_authentication_repository'
import * as refreshTokenRepo from './refresh_token_repository'
import * as principalRepo from './principal_repository'
import { connectUseCase, reactToEventSync, sideEffect } from '../lib/use-case'
import { events, userAuthentication } from './domain'

export const signIn = connectUseCase({
  mapCommand: (cmd) => ({ userIdentifier: cmd.userIdentifier }),
  fetchAggregate: async (command: { userIdentifier: string }, clients) => {
    const userAuthentication = await userAuthenticationRepo
      .whereByUserIdentifier(command, clients)

    const principal = await principalRepo
      .where({ id: userAuthentication.id }, clients)

    return { userAuthentication, principal }
  },
  ensureAggregate: async (aggregate, clients) => {
    await refreshTokenRepo.ensure(aggregate.refreshToken, clients)
    return aggregate
  },
  useCase: useCases.signIn
})

export const register = connectUseCase({
  fetchAggregate: async () => undefined,
  ensureAggregate: userAuthenticationRepo.create,
  mapCommand: () => undefined,
  useCase: useCases.signUp
})

export const confirmAccount = connectUseCase({
  fetchAggregate: userAuthenticationRepo.where,
  ensureAggregate: userAuthenticationRepo.ensure,
  mapCommand: (cmd) => ({ id: cmd.id }),
  useCase: useCases.confirmAccount
})

export const requestPasswordReset = connectUseCase({
  fetchAggregate: userAuthenticationRepo.where,
  ensureAggregate: userAuthenticationRepo.ensure,
  mapCommand: (cmd) => ({ id: cmd.id }),
  useCase: useCases.requestPasswordReset
})

export const resetPasswordByToken = connectUseCase({
  fetchAggregate: userAuthenticationRepo.where,
  ensureAggregate: userAuthenticationRepo.ensure,
  mapCommand: (cmd) => ({ id: cmd.id }),
  useCase: useCases.resetPasswordByToken
})

const sendEmail = sideEffect({
  aggregate: userAuthentication,
  sideEffect: async (aggregate, clients) => {
    console.log(aggregate)
  }
})

reactToEventSync({
  event: events.userRegistered,
  mapper: (event) => event.userAuthentication,
  useCase: sendEmail
})