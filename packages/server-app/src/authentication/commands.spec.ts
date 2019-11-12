import {
  assertThat,
  equalTo,
  hasProperties,
  everyItem,
  truthy as present
// @ts-ignore
} from 'hamjest'
import { LocalDateTime, nativeJs } from 'js-joda'
import sinon from 'ts-sinon'
import {
  register,
  requestPasswordReset,
  resetPasswordByToken,
  confirm
} from './commands'
import {
  create as createUserAuthenticationFactory,
  userAuthenticationFactory,
  requestedPasswordReset,
  DUMMY_TOKEN,
  unconfirmed
} from './factories'
import { findUserByAuthentication } from './queries'
import { withMockedDate, t } from '../spec-helpers'
import { Err } from 'space-lift'

const sendMail = sinon.spy()

describe('user/register', () => {
  it('when identifier is used twice, returns error', t(async ({ withinConnection }) => {
    await register({ withinConnection, sendMail }, {
      userIdentifier: 'sepp',
      password: 'huber'
    })
    const result = await register({ withinConnection, sendMail }, {
      userIdentifier: 'sepp',
      password: 'huber'
    })
    assertThat(result, equalTo(Err('User Identifier already taken')))
  }))

  it('sends a registration email', t(async ({ withinConnection }) => {
    const sendMail = sinon.spy()
    await register({ withinConnection, sendMail }, {
      userIdentifier: 'sepp',
      password: 'huber'
    })

    assertThat(sendMail.lastCall.args[0], hasProperties({
      type: 'RegisterEmail',
      to: 'sepp'
    }))
  }))
})

describe('user/confirm', () => {
  it('when token was found, sets confirmationToken to null', t(async ({ withinConnection }) => {
    const auth = await createUserAuthenticationFactory({ withinConnection },
      userAuthenticationFactory.build(unconfirmed))

    await confirm({ withinConnection }, {
      userIdentifier: auth.userIdentifier,
      token: DUMMY_TOKEN
    })

    return withinConnection(async ({ client }) => {
      const result = await client.query('select * from user_authentication')
      assertThat(result.rows, everyItem(hasProperties({
        confirmationToken: null,
        confirmedAt: present()
      })))
    })
  }))

  it('when token was NOT found, returns token not found error', t(async ({ withinConnection }) => {
    const auth = await createUserAuthenticationFactory({ withinConnection },
      userAuthenticationFactory.build(unconfirmed))

    const result = await confirm({ withinConnection }, {
      userIdentifier: auth.userIdentifier,
      token: 'unknown token'
    })

    assertThat(result, equalTo(Err('NOT_FOUND')))
  }))

  it('when user was not found', t(async ({ withinConnection }) => {
    const result = await confirm({ withinConnection }, {
      userIdentifier: 'unknown user',
      token: 'invalid token'
    })

    assertThat(result, equalTo(Err('NOT_FOUND')))
  }))
})

describe('user/requestPasswordReset', () => {
  it('sends a pw reset email', t(async ({ withinConnection }) => {
    const sendMail = sinon.spy()
    await createUserAuthenticationFactory({ withinConnection }, userAuthenticationFactory.build())
    await requestPasswordReset({ withinConnection, sendMail }, {
      userIdentifier: 'sepp'
    })
    assertThat(sendMail.lastCall.args[0], hasProperties({
      type: 'PasswordResetRequestEmail',
      to: 'sepp'
    }))
  }))

  it('does not send an email on unknown user', t(async ({ withinConnection }) => {
    const sendMail = sinon.spy()
    await requestPasswordReset({ withinConnection, sendMail }, {
      userIdentifier: 'unknown user'
    })
    assertThat(sendMail.callCount, equalTo(0))
  }))

  it('sets passwordResetCreatedAt', t(async ({ withinConnection }) => {
    return withMockedDate('2000-01-01', async () => {
      await createUserAuthenticationFactory({ withinConnection }, userAuthenticationFactory.build())
      await requestPasswordReset({ withinConnection, sendMail }, {
        userIdentifier: 'sepp'
      })
      return withinConnection(async ({ client }) => {
        const result = await client.query('select * from user_authentication')
        assertThat(result.rows[0], hasProperties({
          passwordResetCreatedAt: LocalDateTime.from(nativeJs(new Date()))
        }))
      })
    })
  }))
})

describe('user/resetPasswordByToken', () => {
  it('after success, user can sign in with new password', t(async ({ withinConnection, client }) => {
    const auth = await createUserAuthenticationFactory({ withinConnection },
      userAuthenticationFactory.build(requestedPasswordReset))

    await resetPasswordByToken({ withinConnection }, {
      userIdentifier: auth.userIdentifier,
      token: DUMMY_TOKEN,
      password: 'new password'
    })

    assertThat(await findUserByAuthentication({ client }, {
      userIdentifier: auth.userIdentifier,
      password: 'new password'
    }), present())
  }))

  it('after success, relevant attributes are set to null', t(async ({ withinConnection }) => {
    const auth = await createUserAuthenticationFactory({ withinConnection },
      userAuthenticationFactory.build(requestedPasswordReset))

    await resetPasswordByToken({ withinConnection }, {
      userIdentifier: auth.userIdentifier,
      token: DUMMY_TOKEN,
      password: 'new password'
    })

    return withinConnection(async ({ client }) => {
      const result = await client.query('select * from user_authentication')
      assertThat(result.rows[0], hasProperties({
        passwordResetCreatedAt: null,
        passwordResetToken: null,
        passwordChangedAt: present()
      }))
    })
  }))

  it('after token expired, pw is not resetted', t(async ({ withinConnection, client }) => {
    await withMockedDate('2000-01-01', async (remockDate) => {
      const auth = await createUserAuthenticationFactory({ withinConnection },
        userAuthenticationFactory.build({
          ...requestedPasswordReset,
          passwordResetCreatedAt: LocalDateTime.from(nativeJs(new Date()))
        }))

      remockDate('2000-01-02')

      await resetPasswordByToken({ withinConnection }, {
        userIdentifier: auth.userIdentifier,
        token: DUMMY_TOKEN,
        password: 'new password'
      })

      assertThat(await findUserByAuthentication({ client }, {
        userIdentifier: auth.userIdentifier,
        password: 'new password'
      }), equalTo(Err('NOT_FOUND')))
    })
  }))
})
