import * as useCases from './use-cases'
import * as userAuthenticationRepo from './user_authentication_repository'
import * as refreshTokenRepo from './refresh_token_repository'
import * as principalRepo from './principal_repository'
import { connectUseCase } from '../lib/use-case'

export const signIn = connectUseCase({
  mapCommand: (cmd) => ({ id: cmd.id }),
  fetchAggregate: async (command: { id: string }, clients) => {
    const [userAuthentication, principal] = await Promise.all([
      userAuthenticationRepo.where(command, clients),
      principalRepo.where(command, clients)
    ])
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
  ensureAggregate: userAuthenticationRepo.ensure,
  mapCommand: () => {},
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
