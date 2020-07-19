import uuid from 'uuid'
import { t, assertDifference } from '../spec-helpers'
import { ensure, destroy } from './repository'
import { Company, companyAggregate, addEmployee } from './commands'
import { assertThat, truthy, hasProperty } from 'hamjest'

describe('invitation repository', () => {
  const company: Company = {
    id: uuid(),
    name: 'Some company',
    employees: [{ id: uuid(), role: 'employee' }]
  }

  describe('ensure', () => {
    describe('WHEN record does not exist', () => {
      it('creates a new company', t(async ({ client }) => {
        await assertDifference({ client }, 'company', 1, async () => {
          const result = await ensure(company, client)
          assertThat(companyAggregate.is(result[0]), truthy())
        })
      }))

      it('creates a new employee', t(async ({ client }) => {
        await assertDifference({ client }, 'company_employee', 1, async () => {
          const result = await ensure(company, client)
          assertThat(companyAggregate.is(result[0]), truthy())
        })
      }))
    })

    describe('WHEN record exists', () => {
      it('does not create a new company, but updates name', t(async ({ client }) => {
        await ensure(company, client)
        await assertDifference({ client }, 'company_employee', 0, async () => {
          const updatedName = 'updated'
          const result = await ensure({ ...company, name: updatedName }, client)
          assertThat(result, hasProperty('0.name', updatedName))
        })
      }))

      it('removes additional employees', t(async ({ client }) => {
        const [updatedCompany] = addEmployee({
          aggregate: company,
          action: { personId: uuid(), companyId: company.id }
        })

        await ensure(updatedCompany, client)
        await assertDifference({ client }, 'company_employee', -1, async () => {
          const updatedName = 'updated'
          const result = await ensure({ ...company, name: updatedName }, client)
          assertThat(result, hasProperty('0.name', updatedName))
        })
      }))
    })
  })

  describe('destroy', () => {
    it('removes company', t(async ({ client }) => {
      await ensure(company, client)
      await assertDifference({ client }, 'company', -1, async () => {
        await destroy(company.id, client)
      })
    }))

    it('removes employees', t(async ({ client }) => {
      await ensure(company, client)
      await assertDifference({ client }, 'company_employee', -1, async () => {
        await destroy(company.id, client)
      })
    }))
  })
})
