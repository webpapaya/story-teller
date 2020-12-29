import * as repository from './repository.types'
import { principal, Principal } from '../domain'
import { buildRecordRepository } from '../../lib/build-repository'
import { AggregateInvalid } from '../../errors'

const toDomain = (response: repository.IWherePrincipalResult): Principal => {
  const mappedResponse = {
    // @ts-expect-error
    id: response.jsonBuildObject.id,
    // @ts-expect-error
    employedIn: response.jsonBuildObject.employedIn || []
  }

  return principal
    .decode(mappedResponse)
    .mapError((e) => { throw new AggregateInvalid(e) })
    .get()
}

export const where = buildRecordRepository({
  dbFunction: repository.wherePrincipal,
  toRepository: (params: { id: string }) => ({ id: params.id }),
  toDomain
})
