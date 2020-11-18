import { assertThat, hasProperties, hasProperty, throws } from 'hamjest'
import {
  Company,
  addEmployee,
  removeEmployee,
  setEmployeeRole,
  rename,
  create
} from './use-cases'
import { v4 as uuid } from 'uuid'
import { hasAggregate } from '../utils/custom-matcher'

const company: Company = {
  id: uuid(),
  name: 'Some company',
  employees: []
}

describe('company', () => {
  describe('create', () => {
    context('WHEN command is valid', () => {
      it('sets name of company', () => {
        const command = {
          id: uuid(),
          name: 'company name',
          principalId: uuid()
        }
        assertThat(create.run({ aggregate: undefined, command }),
          hasAggregate(hasProperty('name', command.name)))
      })

      it('AND adds principalId as manager', () => {
        const command = {
          id: uuid(),
          name: 'company name',
          principalId: uuid()
        }
        assertThat(create.run({ aggregate: undefined, command }),
          hasAggregate(hasProperties({
            employees: [{
              id: command.principalId,
              userId: command.principalId,
              role: 'manager'
            }]
          })))
      })
    })

    it('WHEN command is invalid (empty name), throws', () => {
      const command = {
        id: uuid(),
        name: '',
        principalId: uuid()
      }
      assertThat(() => create.run({ aggregate: undefined, command }), throws())
    })
  })

  describe('addEmployee', () => {
    it('WHEN employee not already added, adds employee to company', () => {
      const personId = uuid()
      assertThat(addEmployee.run({
        aggregate: company,
        command: { companyId: company.id, personId }
      }), hasAggregate(hasProperties({
        employees: [{ id: personId, userId: personId, role: 'employee' }]
      })))
    })

    it('WHEN employee is already present in company, does not add employee twice', () => {
      const personId = uuid()
      assertThat(addEmployee.run({
        aggregate: { ...company, employees: [{ id: personId, userId: personId, role: 'manager' }] },
        command: { companyId: company.id, personId }
      }), hasAggregate(hasProperty('employees.0', { id: personId, userId: personId, role: 'manager' })))
    })
  })

  describe('remove employee', () => {
    it('WHEN employee not already added, does nothing', () => {
      const personId = uuid()

      assertThat(removeEmployee.run({
        aggregate: company,
        command: { companyId: company.id, personId }
      }), hasAggregate(hasProperties({ employees: [] })))
    })

    it('WHEN employee is in company, removes it', () => {
      const personId = uuid()

      assertThat(removeEmployee.run({
        aggregate: { ...company, employees: [{ id: personId, userId: personId, role: 'manager' }] },
        command: { companyId: company.id, personId }
      }), hasAggregate(hasProperties({
        employees: []
      })))
    })
  })

  describe('rename', () => {
    it('renames company', () => {
      const updatedName = 'updated'
      assertThat(rename.run({ aggregate: company, command: { companyId: company.id, name: updatedName } }),
        hasAggregate(hasProperty('name', updatedName)))
    })
  })

  describe('setEmployeeRole', () => {
    it('WHEN employee exists, sets role', () => {
      const personId = uuid()

      assertThat(setEmployeeRole.run({
        aggregate: { ...company, employees: [{ id: personId, userId: personId, role: 'manager' }] },
        command: { companyId: company.id, personId, role: 'employee' }
      }), hasAggregate(hasProperty('employees.0.role', 'employee')))
    })

    it('WHEN employee does not exists, does nothing', () => {
      const personId = uuid()

      assertThat(setEmployeeRole.run({
        aggregate: { ...company, employees: [] },
        command: { companyId: company.id, personId, role: 'employee' }
      }), hasAggregate(hasProperty('employees', [])))
    })
  })
})
