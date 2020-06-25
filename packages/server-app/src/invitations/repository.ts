import { assertThat, hasProperties, equalTo, hasProperty } from 'hamjest'
import { t, assertDifference } from '../spec-helpers'
import { ensureInvitation } from './repository.types'
import uuid from 'uuid'
import { Invitation, invitationAggregate } from './commands'
import { LocalDateTime } from '@story-teller/shared/node_modules/js-joda'
import { PreparedQuery, } from '@pgtyped/query';
import { PoolClient } from 'pg'

const buildRepository = <DomainObject, DBType, Params>(config: {
  query: PreparedQuery<Params, DBType>,
  toRepository: (input: DomainObject) => Params,
  toDomain: (input: DBType) => DomainObject,
}) => async (input: DomainObject, client: PoolClient) => {
  const repository = config.toRepository(input)
  const result = await config.query.run(repository, client)
  return result.map((item) => config.toDomain(item))
}

const ensure = buildRepository({
  query: ensureInvitation,
  toRepository: (invitation: Invitation) => {
    const {response, ...rest} = invitation
    const kind = response?.kind
    const answeredAt = response?.answeredAt
    const invitedAt = rest.invitedAt
    return { ...rest, invitedAt, answeredAt, kind }
  },
  toDomain: (response) => {
    const { kind, answeredAt, ...invitation } = response
    const result = {
      ...invitation,
      response: kind && answeredAt ? { kind, answeredAt } : undefined
    }

    if (invitationAggregate.is(result)) { return result }
    throw new Error('Decoding error')
  }

})

describe.only('ensureInvitation', () => {
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
    },
  }

  it('creates a new record', t(async ({ client }) => {
    await assertDifference({ client }, 'invitation', 1, async () => {
      const result = await ensure(invitation, client)
      assertThat(result, hasProperty('0.id', invitation.id))
    })
  }))
})
