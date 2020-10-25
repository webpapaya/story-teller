import * as useCases from './use-cases'
import * as repository from './repository'
import { connectUseCase } from '../lib/use-case'

export const rejectRequest = connectUseCase({
  useCase: useCases.rejectRequest,
  mapCommand: (command) => ({ id: command.id }),
  fetchAggregate: repository.whereId,
  ensureAggregate: repository.ensure,
})

export const confirmRequest = connectUseCase({
  useCase: useCases.confirmRequest,
  mapCommand: (command) => ({ id: command.id }),
  fetchAggregate: repository.whereId,
  ensureAggregate: repository.ensure,
})

export const deleteRequest = connectUseCase({
  useCase: useCases.deleteRequest,
  mapCommand: (command) => ({ id: command.id }),
  fetchAggregate: repository.whereId,
  ensureAggregate: repository.ensure,
})

export const requestVacation = connectUseCase({
  useCase: useCases.requestVacation,
  mapCommand: () => undefined,
  fetchAggregate: async () => undefined,
  ensureAggregate: repository.ensure,
})

