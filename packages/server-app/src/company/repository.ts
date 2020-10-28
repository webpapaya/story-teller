import { ensureCompany, deleteCompanyById } from './repository.types'
import { Company } from './use-cases'
import { buildRepository } from '../lib/build-repository'

export const ensure = buildRepository({
  dbFunction: ensureCompany,
  toRepository: (company: Company) => {
    return {
      id: company.id,
      name: company.name,
      employees: company.employees.map((employee) => ({ ...employee, company_id: company.id }))
    }
  },
  toDomain: (dbResult) => {
    return dbResult.jsonBuildObject?.valueOf()
  }
})

export const destroy = buildRepository({
  dbFunction: deleteCompanyById,
  toRepository: (id: Company['id']) => {
    return { id: id }
  },
  toDomain: () => {}
})
