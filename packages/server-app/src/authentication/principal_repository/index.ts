import * as repository from './repository.types'
import { principal, Principal } from '../domain'
import { buildRecordRepository } from '../../lib/build-repository'

const toDomain = (response: repository.IWherePrincipalResult): Principal => {
  const mappedResponse = {
    // @ts-expect-error
    id: response.jsonBuildObject.id,
    // @ts-expect-error
    employedIn: response.jsonBuildObject.employedIn || []
  }

  if (principal.is(mappedResponse)) { return mappedResponse }
  throw new Error('Decoding error')
}

export const where = buildRecordRepository({
  dbFunction: repository.wherePrincipal,
  toRepository: (params: { id: string }) => ({ id: params.id }),
  toDomain
})