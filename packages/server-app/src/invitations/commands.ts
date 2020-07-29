import { v } from '@story-teller/shared'
import { useCase, aggregateFactory } from '../utils/use-case'
import { nonEmptyString } from '@story-teller/shared/dist/lib'
import { LocalDateTime } from '@story-teller/shared/node_modules/js-joda'

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
    id: v.uuid,
    companyName: nonEmptyString,
    companyId: v.uuid,
    inviteeId: v.uuid,
    inviterId: v.uuid
  }),
  acceptInvitation: v.record({
    id: v.uuid
  }),
  rejectInvitation: v.record({
    id: v.uuid
  })
} as const

export const events = {
  invitationAccepted: v.record({
    companyId: v.uuid,
    inviteeId: v.uuid
  })
} as const

export const inviteToCompany = aggregateFactory({
  action: actions.inviteToCompany,
  aggregateFrom: v.undefinedCodec,
  aggregateTo: invitationAggregate,
  events: [],
  execute: ({ action }) => ({ ...action, invitedAt: LocalDateTime.now(), response: undefined })
})

export const acceptInvitation = useCase({
  aggregate: invitationAggregate,
  action: actions.acceptInvitation,
  events: [{
    event: events.invitationAccepted,
    mapper: ({ aggregateAfter }) => ({
      companyId: aggregateAfter.companyId,
      inviteeId: aggregateAfter.inviteeId
    })
  }],
  preCondition: ({ aggregate, action }) => aggregate.id === action.id,
  execute: ({ aggregate }) => ({
    ...aggregate,
    response: { kind: 'accepted' as const, answeredAt: LocalDateTime.now() }
  })
})

export const rejectInvitation = useCase({
  aggregate: invitationAggregate,
  action: actions.acceptInvitation,
  events: [],
  preCondition: ({ aggregate, action }) => aggregate.id === action.id,
  execute: ({ aggregate }) => ({
    ...aggregate,
    response: { kind: 'rejected' as const, answeredAt: LocalDateTime.now() }
  })
})
