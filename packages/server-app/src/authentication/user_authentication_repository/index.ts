import * as repository from './repository.types'
import { UserAuthentication, userAuthentication } from '../domain'
import { buildRecordRepository } from '../../lib/build-repository'

const toDomain = (response: repository.IEnsureUserAuthenticationResult): UserAuthentication => {
  const mappedResponse = {
    id: response.id,
    userIdentifier: response.userIdentifier,
    createdAt: response.createdAt,
    password: response.password,
    confirmation: response.confirmationToken
      ? {
        state: 'active' as const,
        token: response.confirmationToken,
        createdAt: response.confirmationTimestamp,
        plainToken: undefined
      } : {
        state: 'inactive',
        usedAt: response.confirmationTimestamp
      },
    passwordReset: response.passwordResetToken
      ? {
        state: 'active' as const,
        token: response.passwordResetToken,
        createdAt: response.passwordResetTimestamp,
        plainToken: undefined
      } : {
        state: 'inactive',
        usedAt: response.passwordResetTimestamp
      }
  }

  if (userAuthentication.is(mappedResponse)) { return mappedResponse }
  throw new Error('Decoding error')
}

const toRepository = (userAuthentication: UserAuthentication) => {
  return {
    id: userAuthentication.id,
    created_at: userAuthentication.createdAt,
    user_identifier: userAuthentication.userIdentifier,
    password: userAuthentication.password,

    confirmation_token: userAuthentication.confirmation.state === 'active'
      ? userAuthentication.confirmation.token
      : null,
    confirmation_timestamp: userAuthentication.confirmation.state === 'inactive'
      ? userAuthentication.confirmation.usedAt
      : userAuthentication.confirmation.createdAt,

    password_reset_token: userAuthentication.passwordReset.state === 'active'
      ? userAuthentication.passwordReset.token
      : null,
    password_reset_timestamp: userAuthentication.passwordReset.state === 'inactive'
      ? userAuthentication.passwordReset.usedAt
      : userAuthentication.passwordReset.createdAt
  }
}

export const ensure = buildRecordRepository({
  dbFunction: repository.ensureUserAuthentication,
  toRepository,
  toDomain
})

export const create = buildRecordRepository({
  dbFunction: repository.createUserAuthentication,
  toRepository,
  toDomain
})

export const where = buildRecordRepository({
  dbFunction: repository.whereUserAuthentication,
  toRepository: (params: { id: string }) => ({ id: params.id }),
  toDomain
})

export const whereByUserIdentifier = buildRecordRepository({
  dbFunction: repository.whereUserAuthenticationByUserIdentifier,
  toRepository: (params: { userIdentifier: string }) => ({
    user_identifier: params.userIdentifier
  }),
  toDomain
})
