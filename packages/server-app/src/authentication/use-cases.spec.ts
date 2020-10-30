import {
  assertThat,
  equalTo,
  hasProperties,
  everyItem,
  truthy as present
} from 'hamjest'
import { LocalDateTime, nativeJs } from 'js-joda'
import sinon from 'ts-sinon'
import {
  register,
  requestPasswordReset,
  resetPasswordByToken,
  confirm
} from './use-cases'
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
  it('when identifier is used twice, returns error', t(async (clients) => {
    await register({ ...clients, sendMail }, {
      userIdentifier: 'sepp',
      password: 'huber'
    })
    const result = await register({ ...clients, sendMail }, {
      userIdentifier: 'sepp',
      password: 'huber'
    })
    assertThat(result, equalTo(Err('User Identifier already taken')))
  }))

  it('sends a registration email', t(async (clients) => {
    const sendMail = sinon.spy()
    await register({ ...clients, sendMail }, {
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
  it('when token was found, sets confirmationToken to null', t(async (clients) => {
    const auth = await createUserAuthenticationFactory(clients,
      userAuthenticationFactory.build(unconfirmed))

    await confirm(clients, {
      userIdentifier: auth.userIdentifier,
      token: DUMMY_TOKEN
    })

    const result = await clients.pgClient.query('select * from user_authentication')
    assertThat(result.rows, everyItem(hasProperties({
      confirmationToken: null,
      confirmedAt: present()
    })))
  }))

  it('when token was NOT found, returns token not found error', t(async (clients) => {
    const auth = await createUserAuthenticationFactory(clients,
      userAuthenticationFactory.build(unconfirmed))

    const result = await confirm(clients, {
      userIdentifier: auth.userIdentifier,
      token: 'unknown token'
    })

    assertThat(result, equalTo(Err('NOT_FOUND')))
  }))

  it('when user was not found', t(async (clients) => {
    const result = await confirm(clients, {
      userIdentifier: 'unknown user',
      token: 'invalid token'
    })

    assertThat(result, equalTo(Err('NOT_FOUND')))
  }))
})

describe('user/requestPasswordReset', () => {
  it('sends a pw reset email', t(async (clients) => {
    const sendMail = sinon.spy()
    await createUserAuthenticationFactory(clients, userAuthenticationFactory.build())
    await requestPasswordReset({ ...clients, sendMail }, {
      userIdentifier: 'sepp'
    })
    assertThat(sendMail.lastCall.args[0], hasProperties({
      type: 'PasswordResetRequestEmail',
      to: 'sepp'
    }))
  }))

  it('does not send an email on unknown user', t(async (clients) => {
    const sendMail = sinon.spy()
    await requestPasswordReset({ ...clients, sendMail }, {
      userIdentifier: 'unknown user'
    })
    assertThat(sendMail.callCount, equalTo(0))
  }))

  it('sets passwordResetCreatedAt', t(async (clients) => {
    return await withMockedDate('2000-01-01', async () => {
      await createUserAuthenticationFactory(clients, userAuthenticationFactory.build())
      await requestPasswordReset({ ...clients, sendMail }, {
        userIdentifier: 'sepp'
      })

      const result = await clients.pgClient.query('select * from user_authentication')
      assertThat(result.rows[0], hasProperties({
        passwordResetCreatedAt: LocalDateTime.from(nativeJs(new Date()))
      }))
    })
  }))
})

describe('user/resetPasswordByToken', () => {
  it('after success, user can sign in with new password', t(async (clients) => {
    const auth = await createUserAuthenticationFactory(clients,
      userAuthenticationFactory.build(requestedPasswordReset))

    await resetPasswordByToken(clients, {
      userIdentifier: auth.userIdentifier,
      token: DUMMY_TOKEN,
      password: 'new password'
    })

    assertThat(await findUserByAuthentication(clients, {
      userIdentifier: auth.userIdentifier,
      password: 'new password'
    }), present())
  }))

  it('after success, relevant attributes are set to null', t(async (clients) => {
    const auth = await createUserAuthenticationFactory(clients,
      userAuthenticationFactory.build(requestedPasswordReset))

    await resetPasswordByToken(clients, {
      userIdentifier: auth.userIdentifier,
      token: DUMMY_TOKEN,
      password: 'new password'
    })

    const result = await clients.pgClient.query('select * from user_authentication')
    assertThat(result.rows[0], hasProperties({
      passwordResetCreatedAt: null,
      passwordResetToken: null,
      passwordChangedAt: present()
    }))
  }))

  it('after token expired, pw is not resetted', t(async (clients) => {
    await withMockedDate('2000-01-01', async (remockDate) => {
      const auth = await createUserAuthenticationFactory(clients,
        userAuthenticationFactory.build({
          ...requestedPasswordReset,
          passwordResetCreatedAt: LocalDateTime.from(nativeJs(new Date()))
        }))

      remockDate('2000-01-02')

      await resetPasswordByToken(clients, {
        userIdentifier: auth.userIdentifier,
        token: DUMMY_TOKEN,
        password: 'new password'
      })

      assertThat(await findUserByAuthentication(clients, {
        userIdentifier: auth.userIdentifier,
        password: 'new password'
      }), equalTo(Err('NOT_FOUND')))
    })
  }))
})
