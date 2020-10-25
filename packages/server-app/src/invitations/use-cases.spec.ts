import { assertThat, throws, hasProperties, hasProperty, instanceOf, string } from 'hamjest'
import { inviteToCompany, acceptInvitation, rejectInvitation } from './use-cases'
import uuid from 'uuid'
import { LocalDateTime } from '@story-teller/shared/node_modules/js-joda'
import { hasAggregate, hasEvents } from '../utils/custom-matcher'

describe('invitation', () => {
  const invitation = {
    id: uuid(),
    inviteeId: uuid(),
    inviterId: uuid(),
    companyId: uuid(),
    companyName: 'A company',
    invitedAt: LocalDateTime.now(),
    response: undefined
  }

  describe('inviteToCompany', () => {
    const invite = {
      id: uuid(),
      inviteeId: uuid(),
      inviterId: uuid(),
      companyId: uuid(),
      companyName: 'A company'
    }
    it('creates a new invitation with given values', () => {
      assertThat(inviteToCompany.run({ aggregate: undefined, command: invite }), hasAggregate(hasProperties({
        ...invite,
        id: string(),
        invitedAt: instanceOf(LocalDateTime),
        response: undefined
      })))
    })

    it('WHEN company name is empty, throws error', () => {
      assertThat(() => inviteToCompany.run({ aggregate: undefined, command: { ...invite, companyName: '' } }), throws())
    })
  })

  describe('acceptInvitation', () => {
    it('sets kind to `accepted` and the current timestamp', () => {
      assertThat(acceptInvitation.run({ aggregate: invitation, command: { id: invitation.id } }), hasAggregate(hasProperty('response', hasProperties({
        kind: 'accepted',
        answeredAt: instanceOf(LocalDateTime)
      }))))
    })

    it('emits an invitation accepted event', () => {
      assertThat(acceptInvitation.run({ aggregate: invitation, command: { id: invitation.id } }), hasEvents(hasProperty('length', 1)))
    })
  })

  describe('rejectInvitation', () => {
    it('sets kind to `rejected` and the current timestamp', () => {
      assertThat(rejectInvitation.run({ aggregate: invitation, command: { id: invitation.id } }), hasAggregate(hasProperty('response', hasProperties({
        kind: 'rejected',
        answeredAt: instanceOf(LocalDateTime)
      }))))
    })
  })
})
