import {
  assertThat,
  equalTo,
  hasProperties,
  truthy as present,
  falsy as blank
// @ts-ignore
} from 'hamjest'
import { LocalDateTime, nativeJs } from 'js-joda'
import sinon from 'ts-sinon'
import {
  register,
  findUserByAuthenticationToken
} from './index'
import {
  create as createUserAuthenticationFactory,
  userAuthenticationFactory
} from './factories'
import { AuthenticationToken } from '../domain'
import { findUserById, findUserByAuthentication } from './queries'
import { withMockedDate, t } from '../spec-helpers'

const sendMail = sinon.spy()

describe('findUserById', () => {
  it('when known userId is passed in', t(async ({ withinConnection }) => {
    const auth = await createUserAuthenticationFactory({ withinConnection },
      userAuthenticationFactory.build())

    const result = await withinConnection(({ client }) => {
      return findUserById({ client }, { id: auth.id })
    })
    assertThat(result, hasProperties({
      userIdentifier: equalTo(auth.userIdentifier)
    }))
  }))

  it('when undefined is passed in', t(async ({ withinConnection }) => {
    await createUserAuthenticationFactory({ withinConnection },
      userAuthenticationFactory.build())

    const result = await withinConnection(({ client }) => {
      return findUserById({ client }, { id: undefined as unknown as string })
    })

    assertThat(result, equalTo(undefined))
  }))
})

describe('findUserByAuthentication', () => {
  it('when password matches, returns user', t(async ({ withinConnection, client }) => {
    await register({ withinConnection, sendMail }, {
      userIdentifier: 'sepp',
      password: 'huber'
    })
    assertThat(await findUserByAuthentication({ client }, {
      userIdentifier: 'sepp',
      password: 'huber'
    }), present())
  }))

  it('when password does NOT match, returns undefined', t(async ({ withinConnection, client }) => {
    await register({ withinConnection, sendMail }, {
      userIdentifier: 'sepp',
      password: 'huber'
    })
    assertThat(await findUserByAuthentication({ client }, {
      userIdentifier: 'sepp',
      password: 'huber1'
    }), blank())
  }))
})

describe('findUserByAuthenticationToken', () => {
  it('when password was not reset yet, returns user', t(async ({ withinConnection, client }) => {
    return withMockedDate('2000-01-02', async () => {
      const auth = await createUserAuthenticationFactory({ withinConnection },
        userAuthenticationFactory.build())

      const token: AuthenticationToken = {
        id: auth.id,
        scope: 'user',
        createdAt: LocalDateTime.from(nativeJs(new Date()))
      }

      assertThat(await findUserByAuthenticationToken({ client }, token),
        hasProperties({ id: auth.id }))
    })
  }))

  it('when password changed after token created, returns undefined', t(async ({ withinConnection, client }) => {
    const auth = await createUserAuthenticationFactory({ withinConnection },
      userAuthenticationFactory.build({ passwordChangedAt: LocalDateTime.of(2000, 1, 2) }))

    const token: AuthenticationToken = {
      id: auth.id,
      scope: 'user',
      createdAt: LocalDateTime.of(2000, 1, 1)
    }

    assertThat(await findUserByAuthenticationToken({ client }, token), blank())
  }))

  it('when password changed before token created, returns user', t(async ({ withinConnection, client }) => {
    const auth = await createUserAuthenticationFactory({ withinConnection },
      userAuthenticationFactory.build({ passwordChangedAt: LocalDateTime.of(2000, 1, 1) }))

    const token: AuthenticationToken = {
      id: auth.id,
      scope: 'user',
      createdAt: LocalDateTime.of(2000, 1, 1)
    }

    assertThat(await findUserByAuthenticationToken({ client }, token),
      hasProperties({ id: auth.id }))
  }))
})
