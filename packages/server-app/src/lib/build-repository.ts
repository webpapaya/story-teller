import { PreparedQuery } from '@pgtyped/query'
import { ExternalDependencies } from './use-case'

export const buildRepository = <DomainObject, DBParam, DomainResult, DBResult>(config: {
  dbFunction: PreparedQuery<DBParam, DBResult>
  toRepository: (domainObject: DomainObject) => DBParam
  toDomain: (dbResult: DBResult) => DomainResult
}) => async (params: DomainObject, clients: Pick<ExternalDependencies, 'pgClient'>) => {
  const repository = config.toRepository(params)
  const result = await config.dbFunction.run(repository, clients.pgClient)
  return result.map((item) => config.toDomain(item))
}

export const buildRecordRepository = <DomainObject, DBParam, DomainResult, DBResult>(config: {
  dbFunction: PreparedQuery<DBParam, DBResult>
  toRepository: (domainObject: DomainObject) => DBParam
  toDomain: (dbResult: DBResult) => DomainResult
}) => async (params: DomainObject, clients: Pick<ExternalDependencies, 'pgClient'>) => {
  const repository = config.toRepository(params)
  const result = await config.dbFunction.run(repository, clients.pgClient)
  return config.toDomain(result[0])
}
