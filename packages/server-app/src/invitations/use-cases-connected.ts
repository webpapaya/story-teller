import * as useCases from './use-cases'
import * as repository from './repository'
import { connectUseCase } from '../lib/use-case'

export const acceptInvitation = connectUseCase({
  useCase: useCases.acceptInvitation,
  mapToFetchArgs: (command) => ({ id: command.id }),
  fetchAggregate: repository.whereById,
  ensureAggregate: repository.ensure
})

export const inviteToCompany = connectUseCase({
  useCase: useCases.inviteToCompany,
  mapToFetchArgs: () => undefined,
  fetchAggregate: async () => undefined,
  ensureAggregate: repository.ensure
})

export const rejectInvitation = connectUseCase({
  useCase: useCases.rejectInvitation,
  mapToFetchArgs: (command) => ({ id: command.id }),
  fetchAggregate: repository.whereById,
  ensureAggregate: repository.ensure
})
