import * as queries from './repository.types'
import { CompanyAggregate, companyAggregate } from './use-cases'
import { buildRecordRepository, buildRepository } from '../lib/build-repository'

const toDomain = (dbResult: queries.IWhereIdsResult) => {
  const decoded = companyAggregate.decode(dbResult?.jsonBuildObject?.valueOf())
  if (!decoded.isOk()) {
    throw new Error(JSON.stringify(decoded.get()))
  }
  return decoded.get()
}

export const ensure = buildRepository({
  dbFunction: queries.ensureCompany,
  toRepository: (company: CompanyAggregate) => {
    return {
      id: company.id,
      name: company.name,
      employees: company.employees.map((employee) => ({ ...employee, company_id: company.id }))
    }
  },
  toDomain
})

export const whereId = buildRecordRepository({
  dbFunction: queries.whereIds,
  toRepository: (params: {id: CompanyAggregate['id']}) => {
    return { ids: [params.id] }
  },
  toDomain
})

export const whereIds = buildRepository({
  dbFunction: queries.whereIds,
  toRepository: (params: {ids: Array<CompanyAggregate['id']>}) => {
    return params
  },
  toDomain
})

export const destroy = buildRepository({
  dbFunction: queries.deleteCompanyById,
  toRepository: (id: CompanyAggregate['id']) => {
    return { id: id }
  },
  toDomain: () => {}
})
