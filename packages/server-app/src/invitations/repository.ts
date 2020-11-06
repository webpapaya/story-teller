import { ensureInvitation, deleteInvitationById, whereInvitationId, IWhereInvitationIdResult } from './repository.types'
import { Invitation, invitationAggregate } from './use-cases'
import { buildRecordRepository, buildRepository } from '../lib/build-repository'

const toDomain = (response: IWhereInvitationIdResult): Invitation => {
  const { kind, answeredAt, ...invitation } = response
  const result = {
    ...invitation,
    response: kind && answeredAt ? { kind, answeredAt } : undefined
  }

  if (invitationAggregate.is(result)) { return result as unknown as Invitation }
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

export const whereById = buildRecordRepository({
  dbFunction: whereInvitationId,
  toRepository: (params: { id: Invitation['id']}) => {
    return params
  },
  toDomain
})
