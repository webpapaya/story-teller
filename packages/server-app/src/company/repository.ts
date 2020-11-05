import * as queries from './repository.types'
import { Company, companyAggregate } from './use-cases'
import { buildRecordRepository, buildRepository } from '../lib/build-repository'

const toDomain = (dbResult: queries.IWhereIdResult) => {
  const decoded = companyAggregate.decode(dbResult.jsonBuildObject?.valueOf())

  if (!decoded.isOk()) {
    throw new Error(JSON.stringify(decoded.get()))
  }
  return decoded.get()
}

export const ensure = buildRepository({
  dbFunction: queries.ensureCompany,
  toRepository: (company: Company) => {
    return {
      id: company.id,
      name: company.name,
      employees: company.employees.map((employee) => ({ ...employee, company_id: company.id }))
    }
  },
  toDomain
})

export const whereId = buildRecordRepository({
  dbFunction: queries.whereId,
  toRepository: (params: {id: Company['id']}) => {
    return params
  },
  toDomain
})

export const destroy = buildRepository({
  dbFunction: queries.deleteCompanyById,
  toRepository: (id: Company['id']) => {
    return { id: id }
  },
  toDomain: () => {}
})
