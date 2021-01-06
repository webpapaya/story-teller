import * as useCases from './use-cases'
import * as repository from './repository'
import { connectUseCase } from '../lib/use-case'

export const rejectRequest = connectUseCase({
  useCase: useCases.rejectRequest,
  mapToFetchArgs: (command) => ({ id: command.id }),
  fetchAggregate: repository.whereId,
  ensureAggregate: repository.ensure
})

export const confirmRequest = connectUseCase({
  useCase: useCases.confirmRequest,
  mapToFetchArgs: (command) => ({ id: command.id }),
  fetchAggregate: repository.whereId,
  ensureAggregate: repository.ensure
})

export const deleteRequest = connectUseCase({
  useCase: useCases.deleteRequest,
  mapToFetchArgs: (command) => ({ id: command.id }),
  fetchAggregate: repository.whereId,
  ensureAggregate: repository.ensure
})

export const requestVacation = connectUseCase({
  useCase: useCases.requestVacation,
  mapToFetchArgs: () => undefined,
  fetchAggregate: async () => undefined,
  ensureAggregate: repository.ensure
})
