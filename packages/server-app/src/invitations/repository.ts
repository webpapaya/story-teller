import { PreparedQuery } from '@pgtyped/query'
import { PoolClient } from 'pg'
import { ensureInvitation, deleteInvitationById, findInvitationById, IFindInvitationByIdResult } from './repository.types'
import { Invitation, invitationAggregate } from './commands'

const buildRepository = <DomainObject, DBParam, DomainResult, DBResult>(config: {
  dbFunction: PreparedQuery<DBParam, DBResult>
  toRepository: (domainObject: DomainObject) => DBParam
  toDomain: (dbResult: DBResult) => DomainResult
}) => async (params: DomainObject, client: PoolClient) => {
  const repository = config.toRepository(params)
  const result = await config.dbFunction.run(repository, client)
  return result.map((item) => config.toDomain(item))
}

const toDomain = (response: IFindInvitationByIdResult) => {
  const { kind, answeredAt, ...invitation } = response
  const result = {
    ...invitation,
    response: kind && answeredAt ? { kind, answeredAt } : undefined
  }

  if (invitationAggregate.is(result)) { return result }
  throw new Error('Decoding error')
}

export const ensure = buildRepository({
  dbFunction: ensureInvitation,
  toRepository: (invitation: Invitation) => {
    const { response, ...rest } = invitation
    const kind = response?.kind
    const answeredAt = response?.answeredAt
    const invitedAt = rest.invitedAt
    return {
      ...rest,
      invitedAt,
      answeredAt,
      kind
    }
  },
  toDomain
})

export const destroy = buildRepository({
  dbFunction: deleteInvitationById,
  toRepository: (invitation: Invitation) => {
    return { id: invitation.id }
  },
  toDomain
})

export const whereById = buildRepository({
  dbFunction: findInvitationById,
  toRepository: (id: Invitation['id']) => {
    return { id }
  },
  toDomain
})
