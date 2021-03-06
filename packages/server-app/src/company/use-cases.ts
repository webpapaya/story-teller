import { v } from '@story-teller/shared'
import { aggregateFactory, useCase } from '../lib/use-case'
import { uniqueBy } from '../utils/unique-by'
import { fromTraversable, Lens, Prism } from 'monocle-ts'
import { array } from 'fp-ts/lib/Array'
import { v4 } from 'uuid'

const employeeRoles = v.union([v.literal('manager'), v.literal('employee')])

const employeeEntity = v.entity({
  id: v.uuid,
  userId: v.uuid,
  role: employeeRoles
})
export type Employee = typeof employeeEntity['O']

export const companyAggregate = v.aggregate({
  id: v.uuid,
  name: v.nonEmptyString,
  employees: v.array(employeeEntity)
})

export type CompanyAggregate = typeof companyAggregate['O']

export const actions = {
  create: v.record({
    id: v.uuid,
    name: v.nonEmptyString,
    principalId: v.uuid
  }),
  rename: v.record({
    companyId: v.uuid,
    name: v.nonEmptyString
  }),
  addEmployee: v.record({
    companyId: v.uuid,
    personId: v.uuid
  }),
  removeEmployee: v.record({
    companyId: v.uuid,
    personId: v.uuid
  }),
  setEmployeeRole: v.record({
    companyId: v.uuid,
    personId: v.uuid,
    role: employeeRoles
  })
} as const

const employeeRole = Lens.fromProp<Employee>()('role')
const employees = Lens.fromProp<CompanyAggregate>()('employees')
const employeeTraversal = fromTraversable(array)<Employee>()
const employeePrism = (id: string): Prism<Employee, Employee> => Prism.fromPredicate(child => child.id === id)
const nameLens = Lens.fromProp<CompanyAggregate>()('name')

export const create = aggregateFactory({
  aggregateFrom: v.undefinedCodec,
  aggregateTo: companyAggregate,
  command: actions.create,
  events: [],
  execute: ({ command }) => {
    return {
      id: command.id,
      name: command.name,
      employees: [{
        id: v4(),
        userId: command.principalId,
        role: 'manager' as const
      }]
    }
  }
})

export const rename = useCase({
  aggregate: companyAggregate,
  command: actions.rename,
  events: [],
  execute: ({ command: action, aggregate }) => nameLens.set(action.name)(aggregate)
})

export const addEmployee = useCase({
  aggregate: companyAggregate,
  command: actions.addEmployee,
  events: [],
  execute: ({ aggregate, command: action }) => ({
    ...aggregate,
    employees: uniqueBy('userId', [{
      id: v4(),
      userId: action.personId,
      role: 'employee' as const
    }, ...aggregate.employees])
  })
})

export const removeEmployee = useCase({
  aggregate: companyAggregate,
  command: actions.removeEmployee,
  events: [],
  execute: ({ aggregate, command: action }) => ({
    ...aggregate,
    employees: aggregate
      .employees
      .filter((personId) => personId.id !== action.personId)
  })
})

export const setEmployeeRole = useCase({
  aggregate: companyAggregate,
  command: actions.setEmployeeRole,
  events: [],
  execute: ({ aggregate, command: action }) => employees
    .composeTraversal(employeeTraversal)
    .composePrism(employeePrism(action.personId))
    .composeLens(employeeRole)
    .set(action.role)(aggregate)
})
