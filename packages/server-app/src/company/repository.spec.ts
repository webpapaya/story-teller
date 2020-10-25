import uuid from 'uuid'
import { t, assertDifference } from '../spec-helpers'
import { ensure, destroy } from './repository'
import { Company, companyAggregate, addEmployee } from './use-cases'
import { assertThat, truthy, hasProperty } from 'hamjest'

describe('invitation repository', () => {
  const company: Company = {
    id: uuid(),
    name: 'Some company',
    employees: [{ id: uuid(), role: 'employee' }]
  }

  describe('ensure', () => {
    describe('WHEN record does not exist', () => {
      it('creates a new company', t(async (clients) => {
        await assertDifference(clients, 'company', 1, async () => {
          const result = await ensure(company, clients)
          assertThat(companyAggregate.is(result[0]), truthy())
        })
      }))

      it('creates a new employee', t(async (clients) => {
        await assertDifference(clients, 'company_employee', 1, async () => {
          const result = await ensure(company, clients)
          assertThat(companyAggregate.is(result[0]), truthy())
        })
      }))
    })

    describe('WHEN record exists', () => {
      it('does not create a new company, but updates name', t(async (clients) => {
        await ensure(company, clients)
        await assertDifference(clients, 'company_employee', 0, async () => {
          const updatedName = 'updated'
          const result = await ensure({ ...company, name: updatedName }, clients)
          assertThat(result, hasProperty('0.name', updatedName))
        })
      }))

      it('removes additional employees', t(async (clients) => {
        const [updatedCompany] = addEmployee.run({
          aggregate: company,
          command: { personId: uuid(), companyId: company.id }
        })

        await ensure(updatedCompany, clients)
        await assertDifference(clients, 'company_employee', -1, async () => {
          const updatedName = 'updated'
          const result = await ensure({ ...company, name: updatedName }, clients)
          assertThat(result, hasProperty('0.name', updatedName))
        })
      }))
    })
  })

  describe('destroy', () => {
    it('removes company', t(async (clients) => {
      await ensure(company, clients)
      await assertDifference(clients, 'company', -1, async () => {
        await destroy(company.id, clients)
      })
    }))

    it('removes employees', t(async (clients) => {
      await ensure(company, clients)
      await assertDifference(clients, 'company_employee', -1, async () => {
        await destroy(company.id, clients)
      })
    }))
  })
})
