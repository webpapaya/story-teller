import * as useCases from './use-cases'
import * as repository from './repository'
import { connectUseCase } from '../lib/use-case'

export const create = connectUseCase({
  useCase: useCases.create,
  mapToFetchArgs: () => undefined,
  fetchAggregate: async () => undefined,
  ensureAggregate: repository.ensure
})

export const addEmployee = connectUseCase({
  useCase: useCases.addEmployee,
  mapToFetchArgs: (command) => ({ id: command.companyId }),
  fetchAggregate: repository.whereId,
  ensureAggregate: repository.ensure
})

export const rename = connectUseCase({
  useCase: useCases.rename,
  mapToFetchArgs: (command) => ({ id: command.companyId }),
  fetchAggregate: repository.whereId,
  ensureAggregate: repository.ensure
})

export const removeEmployee = connectUseCase({
  useCase: useCases.removeEmployee,
  mapToFetchArgs: (command) => ({ id: command.companyId }),
  fetchAggregate: repository.whereId,
  ensureAggregate: repository.ensure
})

export const setEmployeeRole = connectUseCase({
  useCase: useCases.setEmployeeRole,
  mapToFetchArgs: (command) => ({ id: command.companyId }),
  fetchAggregate: repository.whereId,
  ensureAggregate: repository.ensure
})
