import { assertThat, throws, hasProperties, hasProperty } from 'hamjest'
import {
  Company,
  addEmployee,
  removeEmployee,
  setEmployeeRole,
  rename,
  reactToInvitationAccepted
} from './use-cases'
import uuid from 'uuid'
import { LocalDateTime } from 'js-joda'
import { hasAggregate } from '../utils/custom-matcher'

const company: Company = {
  id: uuid(),
  name: 'Some company',
  employees: []
}

describe('company', () => {
  describe('addEmployee', () => {
    it('WHEN employee not already added, adds employee to company', () => {
      const personId = uuid()
      assertThat(addEmployee.run({
        aggregate: company,
        command: { companyId: company.id, personId }
      }), hasAggregate(hasProperties({
        employees: [{ id: personId, role: 'employee' }]
      })))
    })

    it('WHEN employee is already present in company, does not add employee twice', () => {
      const personId = uuid()
      assertThat(addEmployee.run({
        aggregate: { ...company, employees: [{ id: personId, role: 'manager' }] },
        command: { companyId: company.id, personId }
      }), hasAggregate(hasProperty('employees.0', { id: personId, role: 'manager' })))
    })

    it('WHEN companyID in cmd is different, throws error', () => {
      assertThat(() => addEmployee.run({
        aggregate: company,
        command: { companyId: 'whatever', personId: uuid() }
      }), throws())
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
        aggregate: { ...company, employees: [{ id: personId, role: 'manager' }] },
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
        aggregate: { ...company, employees: [{ id: personId, role: 'manager' }] },
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

describe('reactions', () => {
  it('reactToInvitationAccepted', () => {
    const invitation = {
      id: uuid(),
      inviteeId: uuid(),
      inviterId: uuid(),
      companyId: company.id,
      companyName: 'A company',
      invitedAt: LocalDateTime.now(),
      response: undefined
    }

    assertThat(reactToInvitationAccepted({
      event: { aggregate: invitation },
      aggregate: company
    }), hasAggregate(hasProperty('employees.length', 1)))
  })
})