import { PreparedQuery } from '@pgtyped/query'
import { PoolClient } from 'pg'
import { ensureCompany, deleteCompanyById } from './repository.types'
import { Company } from './commands'

const buildRepository = <DomainObject, DBParam, DomainResult, DBResult>(config: {
  dbFunction: PreparedQuery<DBParam, DBResult>,
  toRepository: (domainObject: DomainObject) => DBParam,
  toDomain: (dbResult: DBResult) => DomainResult
}) => async (params: DomainObject, client: PoolClient) => {
  const repository = config.toRepository(params)
  const result = await config.dbFunction.run(repository, client)
  return result.map((item) => config.toDomain(item))
}


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
