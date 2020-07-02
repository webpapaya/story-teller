import { assertThat, throws, hasProperties, hasProperty,  } from 'hamjest'
import { Company, addEmployee, removeEmployee, setEmployeeRole, rename } from './commands'
import uuid from 'uuid'


describe('invitation', () => {
  const company: Company = {
    id: uuid(),
    name: 'Some company',
    employeeIds: [],
  };

  describe('addEmployee', () => {
    it('WHEN employee not already added, adds employee to company', () => {
      const personId = uuid()
      assertThat(addEmployee.runReader(company, { companyId: company.id, personId }), hasProperties({
        employeeIds: [personId]
      }))
    })

    it('WHEN employee is already present in company, does not add employee twice', () => {
      const personId = uuid()
      assertThat(addEmployee.runReader({ ...company, employeeIds: [{ id: personId, role: 'manager'}] }, { companyId: company.id, personId }),
        hasProperty('employeeIds.0', { id: personId, role: 'manager' }))
    })

    it('WHEN companyID in cmd is different, throws error', () => {
      assertThat(() => addEmployee.runReader(company, { companyId: 'whatever', personId: uuid()}), throws())
    })
  })

  describe('remove employee', () => {
    it('WHEN employee not already added, does nothing', () => {
      const personId = uuid()
      assertThat(removeEmployee.runReader(company, { companyId: company.id, personId }), hasProperties({
        employeeIds: []
      }))
    })

    it('WHEN employee is in company, removes it', () => {
      const personId = uuid()
      assertThat(removeEmployee.runReader({ ...company, employeeIds: [{ id: personId, role: 'manager'}]  }, { companyId: company.id, personId }), hasProperties({
        employeeIds: []
      }))
    })
  })

  describe('rename', () => {
    it('renames company', () => {
      const updatedName = 'updated'
      assertThat(rename.runReader(company, { companyId: company.id, name: updatedName}), hasProperty('name', updatedName))
    })
  })

  describe('setEmployeeRole', () => {
    it('WHEN employee exists, sets role', () => {
      const personId = uuid()
      assertThat(setEmployeeRole.runReader({ ...company, employeeIds: [{ id: personId, role: 'manager'}] }, { companyId: company.id, personId, role: 'employee' }),
        hasProperty('employeeIds.0.role', 'employee'))
    })

    it('WHEN employee does not exists, does nothing', () => {
      const personId = uuid()
      assertThat(setEmployeeRole.runReader({ ...company, employeeIds: [] }, { companyId: company.id, personId, role: 'employee' }),
        hasProperty('employeeIds', []))
    })
  })
})

