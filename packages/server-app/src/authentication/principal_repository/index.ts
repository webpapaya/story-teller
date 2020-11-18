import * as repository from './repository.types'
import { principal, Principal } from '../domain'
import { buildRecordRepository } from '../../lib/build-repository'

const toDomain = (response: repository.IWherePrincipalResult): Principal => {
  const mappedResponse = response.jsonBuildObject
  if (principal.is(mappedResponse)) { return mappedResponse }
  throw new Error('Decoding error')
}

export const where = buildRecordRepository({
  dbFunction: repository.wherePrincipal,
  toRepository: (params: { id: string }) => ({ id: params.id }),
  toDomain
})

