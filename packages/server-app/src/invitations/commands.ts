import { v } from '@story-teller/shared'
import { useCaseWithArgFromCodec, useCaseFromCodec } from '../project/use-case'
import { nonEmptyString } from '@story-teller/shared/dist/lib'
import { LocalDateTime } from '@story-teller/shared/node_modules/js-joda'

// const nonEmptyString = v.clampedString(1, Number.POSITIVE_INFINITY)
// const signIn = v.record({
//   userIdentifier: v.string,
//   password: v.string
// })
// const signUp = v.record({
//   userIdentifier: v.string,
//   password: v.string,
//   termsAccepted: v.string,
// })

// const company = v.aggregate({
//   id: v.uuid,
//   name: nonEmptyString,
//   ownerId: v.uuid,
// })

// const createCompany = v.record({
//   id: v.uuid,
//   name: nonEmptyString,
//   ownerId: v.uuid
// })

// const leaveCompany = v.record({
//   companyId: v.uuid,
// })

// const renameCompany = v.record({
//   companyId: v.uuid,
//   name: v.uuid,
// })

// context invitations
export const invitationAggregate = v.aggregate({
  id: v.uuid,
  companyName: v.nonEmptyString,
  companyId: v.uuid,
  inviteeId: v.uuid,
  inviterId: v.uuid,
  invitedAt: v.localDateTime,
  response: v.option(v.record({
    kind: v.union([v.literal('accepted'), v.literal('rejected')]),
    answeredAt: v.localDateTime
  }))
})

export type Invitation = typeof invitationAggregate['O']

export const actions = {
  inviteToCompany: v.record({
    companyName: nonEmptyString,
    companyId: v.uuid,
    inviteeId: v.uuid,
    inviterId: v.uuid,
  }),
  acceptInvitation: v.record({
    id: v.uuid,
  }),
  rejectInvitation: v.record({
    id: v.uuid
  })
} as const


export const inviteToCompany = useCaseFromCodec(actions.inviteToCompany)
  .map((payload) => ({ ...payload, invitedAt: LocalDateTime.now(), response: undefined }))

export const acceptInvitation = useCaseWithArgFromCodec(invitationAggregate, actions.acceptInvitation)
  .preCondition((aggregate, action) => aggregate.id === action.id)
  .map((payload) => ({ ...payload, response: { kind: 'accepted', answeredAt: LocalDateTime.now() } }))

export const rejectInvitation = useCaseWithArgFromCodec(invitationAggregate, actions.rejectInvitation)
  .preCondition((aggregate, action) => aggregate.id === action.id)
  .map((payload) => ({ ...payload, response: { kind: 'rejected', answeredAt: LocalDateTime.now() } }))