import * as useCases from './use-cases'
import * as repository from './repository'
import { connectUseCase } from '../lib/use-case'

// const createToken = connectUseCase({
//   fetchAggregate: repository.where,
//   ensureAggregate: repository.ensure,
//   mapCommand: (cmd) => ({ id: cmd.id }),
//   useCase: useCases.createToken,
// })

// const refreshToken = connectUseCase({
//   useCase: useCases.refreshToken,
// })


export const register = connectUseCase({
  fetchAggregate: async () => undefined,
  ensureAggregate: repository.ensure,
  mapCommand: () => {},
  useCase: useCases.signUp,
})

export const confirmAccount = connectUseCase({
  fetchAggregate: repository.where,
  ensureAggregate: repository.ensure,
  mapCommand: (cmd) => ({ id: cmd.id }),
  useCase: useCases.confirmAccount,
})

export const requestPasswordReset = connectUseCase({
  fetchAggregate: repository.where,
  ensureAggregate: repository.ensure,
  mapCommand: (cmd) => ({ id: cmd.id }),
  useCase: useCases.requestPasswordReset,
})

export const resetPasswordByToken = connectUseCase({
  fetchAggregate: repository.where,
  ensureAggregate: repository.ensure,
  mapCommand: (cmd) => ({ id: cmd.id }),
  useCase: useCases.resetPasswordByToken,
})