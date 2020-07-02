import { v } from '@story-teller/shared'
import { useCaseWithArgFromCodec } from '../project/use-case'
import { unique, uniqueBy } from '../utils/unique-by'
import { fromTraversable, Lens, Prism } from 'monocle-ts'
import { array } from 'fp-ts/lib/Array'


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
    name: v.nonEmptyString,
  }),
  addEmployee: v.record({
    companyId: v.uuid,
    personId: v.uuid,
  }),
  removeEmployee: v.record({
    companyId: v.uuid,
    personId: v.uuid,
  }),
  setEmployeeRole: v.record({
    companyId: v.uuid,
    personId: v.uuid,
    role: employeeRoles,
  }),
} as const

const employeeRole = Lens.fromProp<Employee>()('role')
const employees = Lens.fromProp<Company>()('employees')
const employeeTraversal = fromTraversable(array)<Employee>()
const employeePrism = (id: string): Prism<Employee, Employee> => Prism.fromPredicate(child => child.id === id)
const nameLens = Lens.fromProp<Company>()('name')

export const rename = useCaseWithArgFromCodec(companyAggregate, actions.rename)
  .preCondition((company, cmd) => cmd.companyId === company.id)
  .map((company, cmd) => nameLens.set(cmd.name)(company))

export const addEmployee = useCaseWithArgFromCodec(companyAggregate, actions.addEmployee)
  .preCondition((company, cmd) => cmd.companyId === company.id)
  .map((company, cmd) => ({ ...company, employees: uniqueBy('id', [...company.employees, { id: cmd.personId, role: 'employee' }]) }))

export const removeEmployee = useCaseWithArgFromCodec(companyAggregate, actions.removeEmployee)
  .preCondition((company, cmd) => cmd.companyId === company.id)
  .map((company, cmd) => ({ ...company, employees: company.employees.filter((personId: { id: string }) => personId.id !== cmd.personId) }))

export const setEmployeeRole = useCaseWithArgFromCodec(companyAggregate, actions.setEmployeeRole)
  .preCondition((company, cmd) => cmd.companyId === company.id)
  .map((company, cmd) => employees
    .composeTraversal(employeeTraversal)
    .composePrism(employeePrism(cmd.personId))
    .composeLens(employeeRole)
    .set(cmd.role)(company))
