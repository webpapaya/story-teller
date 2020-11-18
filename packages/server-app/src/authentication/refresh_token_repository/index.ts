import * as repository from './repository.types'
import {
  AuthenticationToken,
  authenticationToken
} from '../domain'
import { buildRecordRepository } from '../../lib/build-repository'

const toDomain = (response: repository.IEnsureRefreshTokenResult): AuthenticationToken => {
  const mappedResponse = {
    id: response.id,
    userId: response.userId,
    token: {
      state: 'active' as const,
      token: response.token,
      createdAt: response.createdAt,
      plainToken: undefined
    },
    expiresOn: response.expiresOn,
  }

  if (authenticationToken.is(mappedResponse)) { return mappedResponse }
  throw new Error('Decoding error')
}

const toRepository = (refreshToken: AuthenticationToken) => {
  if (refreshToken.token.state === 'inactive') {
    throw new Error('Inactive token can\'t be stored')
  }

  return {
    id: refreshToken.id,
    user_id: refreshToken.userId,
    token: refreshToken.token.token,
    created_at: refreshToken.token.createdAt,
    expires_on: refreshToken.expiresOn,
  }
}

export const ensure = buildRecordRepository({
  dbFunction: repository.ensureRefreshToken,
  toRepository,
  toDomain
})

export const where = buildRecordRepository({
  dbFunction: repository.whereRefreshToken,
  toRepository: (params: { id: string, userId: string }) => ({
    id: params.id,
    userId: params.userId
  }),
  toDomain
})

