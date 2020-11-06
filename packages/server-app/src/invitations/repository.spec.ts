import { v4 as uuid } from 'uuid'
import { assertThat, hasProperty, promiseThat, rejected } from 'hamjest'
import { LocalDateTime } from '@story-teller/shared/node_modules/js-joda'
import { t, assertDifference } from '../spec-helpers'
import { ensure, destroy, whereById } from './repository'
import { Invitation } from './use-cases'

describe('invitation repository', () => {
  const invitation: Invitation = {
    id: uuid(),
    companyName: 'hallo',
    companyId: uuid(),
    inviteeId: uuid(),
    inviterId: uuid(),
    invitedAt: LocalDateTime.now().withNano(0),
    response: {
      kind: 'accepted',
      answeredAt: LocalDateTime.now().withNano(0)
    }
  }

  describe('find', () => {
    it('WHEN record exists, returns record', t(async (clients) => {
      await ensure(invitation, clients)
      assertThat(await whereById({ id: invitation.id }, clients), hasProperty('id', invitation.id))
    }))

    it('WHEN record does not exist, returns empty array', t(async (clients) => {
      promiseThat(whereById({ id: invitation.id }, clients), rejected())
    }))
  })

  describe('ensure', () => {
    it('WHEN record does not exist, creates a new record', t(async (clients) => {
      await assertDifference(clients, 'invitation', 1, async () => {
        const result = await ensure(invitation, clients)
        assertThat(result, hasProperty('0.id', invitation.id))
      })
    }))

    it('WHEN record already exists, upserts record', t(async (clients) => {
      await ensure(invitation, clients)
      await assertDifference(clients, 'invitation', 0, async () => {
        const updatedCompanyName = 'updated'
        const result = await ensure({ ...invitation, companyName: updatedCompanyName }, clients)
        assertThat(result, hasProperty('0.companyName', updatedCompanyName))
      })
    }))
  })

  describe('destroy', () => {
    it('WHEN record does not exist, returns empty array', t(async (clients) => {
      const result = await destroy(invitation, clients)
      assertThat(result, hasProperty('length', 0))
    }))

    it('WHEN record exists, removes record', t(async (clients) => {
      await ensure(invitation, clients)
      await assertDifference(clients, 'invitation', -1, async () => {
        await destroy(invitation, clients)
      })
    }))
  })
})
