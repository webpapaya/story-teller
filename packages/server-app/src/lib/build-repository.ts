import { PreparedQuery } from '@pgtyped/query'
import { RepositoryError } from '../errors'
import { ExternalDependencies } from './use-case'

export const buildRepository = <DomainObject, DBParam, DomainResult, DBResult>(config: {
  dbFunction: PreparedQuery<DBParam, DBResult>
  toRepository: (domainObject: DomainObject) => DBParam
  toDomain: (dbResult: DBResult) => DomainResult
}) => async (params: DomainObject, clients: Pick<ExternalDependencies, 'pgClient'>) => {
    try {
      const repository = config.toRepository(params)

      const result = await config.dbFunction.run(repository, clients.pgClient)
      return result.map((item) => config.toDomain(item))
    } catch (e) {
      if (e?.message?.startsWith('duplicate key value')) {
        throw new RepositoryError('Record does already exist')
      }
      throw e
    }
  }

export const buildRecordRepository = <DomainObject, DBParam, DomainResult, DBResult>(config: {
  dbFunction: PreparedQuery<DBParam, DBResult>
  toRepository: (domainObject: DomainObject) => DBParam
  toDomain: (dbResult: DBResult) => DomainResult
}) => async (params: DomainObject, clients: Pick<ExternalDependencies, 'pgClient'>) => {
    const result = await buildRepository(config)(params, clients)

    if (result.length === 0) {
      throw new RepositoryError('Record not found')
    }
    return result[0]
  }
