import { assertThat, throws, hasProperties, hasProperty, instanceOf, string } from 'hamjest'
import { inviteToCompany, acceptInvitation, rejectInvitation } from './commands'
import uuid from 'uuid'
import { LocalDateTime } from '@story-teller/shared/node_modules/js-joda'

describe.only('invitation', () => {
  const invitation = {
    id: uuid(),
    inviteeId: uuid(),
    inviterId: uuid(),
    companyId: uuid(),
    companyName: 'A company',
    invitedAt: LocalDateTime.now(),
    response: undefined
  };

  describe('inviteToCompany', () => {
    it('creates a new invitation with given values', () => {
      assertThat(inviteToCompany.runReader(invitation), hasProperties({
        ...invitation,
        id: string(),
        invitedAt: instanceOf(LocalDateTime),
        response: undefined,
      }))
    })

    it('WHEN company name is empty, throws error', () => {
      assertThat(() => inviteToCompany.runReader({ ...invitation, companyName: '' }), throws())
    })
  })

  describe('acceptInvitation', () => {
    it('sets kind to `accepted` and the current timestamp', () => {
      assertThat(acceptInvitation.runReader(invitation, { id: invitation.id }), hasProperty('response', hasProperties({
        kind: 'accepted',
        answeredAt: instanceOf(LocalDateTime)
      })))
    })

    it('WHEN `id` does not match invitation, throws', () => {
      assertThat(() => acceptInvitation.runReader(invitation, { id: uuid() }), throws())
    })
  })

  describe('rejectInvitation', () => {
    it('sets kind to `rejected` and the current timestamp', () => {
      assertThat(rejectInvitation.runReader(invitation, { id: invitation.id }), hasProperty('response', hasProperties({
        kind: 'rejected',
        answeredAt: instanceOf(LocalDateTime)
      })))
    })

    it('WHEN `id` does not match invitation, throws', () => {
      assertThat(() => rejectInvitation.runReader(invitation, { id: uuid() }), throws())
    })
  })
})
