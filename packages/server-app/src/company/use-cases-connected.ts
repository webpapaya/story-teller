import * as useCases from './use-cases'
import * as repository from './repository'
import { connectUseCase } from '../lib/use-case'

export const addEmployee = connectUseCase({
  useCase: useCases.addEmployee,
  mapCommand: (command) => ({ id: command.companyId }),
  fetchAggregate: repository.whereId,
  ensureAggregate: repository.ensure
})

export const rename = connectUseCase({
  useCase: useCases.rename,
  mapCommand: (command) => ({ id: command.companyId }),
  fetchAggregate: repository.whereId,
  ensureAggregate: repository.ensure
})

export const removeEmployee = connectUseCase({
  useCase: useCases.removeEmployee,
  mapCommand: (command) => ({ id: command.companyId }),
  fetchAggregate: repository.whereId,
  ensureAggregate: repository.ensure
})

export const setEmployeeRole = connectUseCase({
  useCase: useCases.setEmployeeRole,
  mapCommand: (command) => ({ id: command.companyId }),
  fetchAggregate: repository.whereId,
  ensureAggregate: repository.ensure
})
