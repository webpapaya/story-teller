import { v4 as uuid } from 'uuid'
import { t, assertDifference } from '../spec-helpers'
import { ensure, destroy, whereId } from './repository'
import { CompanyAggregate, companyAggregate, addEmployee } from './use-cases'
import { assertThat, truthy, hasProperty, equalTo, promiseThat, rejected } from 'hamjest'

describe('invitation repository', () => {
  const company: CompanyAggregate = {
    id: uuid(),
    name: 'Some company',
    employees: [
      { id: uuid(), userId: uuid(), role: 'employee' },
      { id: uuid(), userId: uuid(), role: 'employee' }
    ]
  }

  describe('whereId', () => {
    it('WHEN company exists, returns company', t(async (clients) => {
      await ensure(company, clients)
      assertThat(await whereId({ id: company.id }, clients), equalTo(company))
    }))

    it('WHEN company does not exists, throws error', t(async (clients) => {
      await promiseThat(whereId({ id: company.id }, clients), rejected())
    }))
  })

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

      it.only('saving record twice works', t(async (clients) => {
        const company1 = await ensure(company, clients)
        const company2 = await ensure({ ...company1[0], name: 'changed' }, clients)
        assertThat(company1[0], hasProperty('employees', equalTo(company2[0].employees)))
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
