import { PreparedQuery } from '@pgtyped/query'
import { PoolClient } from 'pg'

export const buildRepository = <DomainObject, DBParam, DomainResult, DBResult>(config: {
  dbFunction: PreparedQuery<DBParam, DBResult>
  toRepository: (domainObject: DomainObject) => DBParam
  toDomain: (dbResult: DBResult) => DomainResult
}) => async (params: DomainObject, client: PoolClient) => {
  const repository = config.toRepository(params)
  const result = await config.dbFunction.run(repository, client)
  return result.map((item) => config.toDomain(item))
}


export const buildRecordRepository = <DomainObject, DBParam, DomainResult, DBResult>(config: {
  dbFunction: PreparedQuery<DBParam, DBResult>
  toRepository: (domainObject: DomainObject) => DBParam
  toDomain: (dbResult: DBResult) => DomainResult
}) => async (params: DomainObject, client: PoolClient) => {
  const repository = config.toRepository(params)
  const result = await config.dbFunction.run(repository, client)
  return config.toDomain(result[0])
}
