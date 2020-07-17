import { v, AnyCodec } from '@story-teller/shared'
import { useCase, domainEventToUseCase } from '../utils/use-case'
import { uniqueBy } from '../utils/unique-by'
import { fromTraversable, Lens, Prism } from 'monocle-ts'
import { array } from 'fp-ts/lib/Array'
import { invitationAggregate } from '../invitations/commands'

const employeeRoles = v.union([v.literal('manager'), v.literal('employee')])

const employeeEntity = v.entity({
  id: v.uuid,
  role: employeeRoles
})
export type Employee = typeof employeeEntity['O']

export const companyAggregate = v.aggregate({
  id: v.uuid,
  name: v.nonEmptyString,
  employees: v.array(employeeEntity)
})

export type Company = typeof companyAggregate['O']

export const actions = {
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

export const events = {
  employeeRoleSet: v.record({
    companyId: v.uuid,
    role: v.nonEmptyString
  }),
} as const

const employeeRole = Lens.fromProp<Employee>()('role')
const employees = Lens.fromProp<Company>()('employees')
const employeeTraversal = fromTraversable(array)<Employee>()
const employeePrism = (id: string): Prism<Employee, Employee> => Prism.fromPredicate(child => child.id === id)
const nameLens = Lens.fromProp<Company>()('name')

export const rename = useCase({
  aggregate: companyAggregate,
  action: actions.rename,
  preCondition: ({ aggregate, action }) => action.companyId === aggregate.id,
  execute: ({ action, aggregate }) => nameLens.set(action.name)(aggregate)
})

export const addEmployee = useCase({
  aggregate: companyAggregate,
  action: actions.addEmployee,
  preCondition: ({aggregate, action}) => action.companyId === aggregate.id,
  execute: ({ aggregate, action }) => ({
    ...aggregate,
    employees: uniqueBy('id', [{
      id: action.personId,
      role: 'employee' as const
    }, ...aggregate.employees])
  })
})

export const removeEmployee = useCase({
  aggregate: companyAggregate,
  action: actions.removeEmployee,
  preCondition: ({aggregate, action}) => action.companyId === aggregate.id,
  execute: ({ aggregate, action }) => ({
    ...aggregate,
    employees: aggregate
      .employees
      .filter((personId) => personId.id !== action.personId)
  })
})

export const setEmployeeRole = useCase({
  aggregate: companyAggregate,
  action: actions.setEmployeeRole,
  events: [
    {
      event: events.employeeRoleSet,
      mapper: ({ aggregateAfter, action }) => ({
        companyId: aggregateAfter.id,
        role: action.role
      })
    },
  ],
  preCondition: ({ aggregate, action }) => action.companyId === aggregate.id,
  execute: ({ aggregate, action }) => employees
    .composeTraversal(employeeTraversal)
    .composePrism(employeePrism(action.personId))
    .composeLens(employeeRole)
    .set(action.role)(aggregate)
})

// ------------

export const reactToInvitationAccepted = domainEventToUseCase({
  event: { aggregate: invitationAggregate },
  useCase: addEmployee,
  mapper: (invitationAccepted) => ({
    companyId: invitationAccepted.companyId,
    personId: invitationAccepted.inviterId
  })
})
