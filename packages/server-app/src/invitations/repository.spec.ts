import uuid from 'uuid'
import { assertThat, hasProperty } from 'hamjest'
import { LocalDateTime } from '@story-teller/shared/node_modules/js-joda'
import { t, assertDifference } from '../spec-helpers'
import { ensure, destroy, whereById } from './repository'
import { Invitation } from './commands'

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
    it('WHEN record exists, returns record', t(async ({ client }) => {
      await ensure(invitation, client)
      assertThat(await whereById(invitation.id, client), hasProperty('0.id', invitation.id))
    }))

    it('WHEN record does not exist, returns empty array', t(async ({ client }) => {
      assertThat(await whereById(invitation.id, client), hasProperty('length', 0))
    }))
  })

  describe('ensure', () => {
    it('WHEN record does not exist, creates a new record', t(async ({ client }) => {
      await assertDifference({ client }, 'invitation', 1, async () => {
        const result = await ensure(invitation, client)
        assertThat(result, hasProperty('0.id', invitation.id))
      })
    }))

    it('WHEN record already exists, upserts record', t(async ({ client }) => {
      await ensure(invitation, client)
      await assertDifference({ client }, 'invitation', 0, async () => {
        const updatedCompanyName = 'updated'
        const result = await ensure({ ...invitation, companyName: updatedCompanyName }, client)
        assertThat(result, hasProperty('0.companyName', updatedCompanyName))
      })
    }))
  })

  describe('destroy', () => {
    it('WHEN record does not exist, returns empty array', t(async ({ client }) => {
      const result = await destroy(invitation, client)
      assertThat(result, hasProperty('length', 0))
    }))

    it('WHEN record exists, removes record', t(async ({ client }) => {
      await ensure(invitation, client)
      await assertDifference({ client }, 'invitation', -1, async () => {
        await destroy(invitation, client)
      })
    }))
  })
})
