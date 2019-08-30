import {
  assertThat,
  equalTo,
  hasProperties,
  everyItem,
  truthy as present
// @ts-ignore
} from 'hamjest'
import mockdate from 'mockdate'
import { LocalDateTime, nativeJs } from 'js-joda'
import sinon from 'ts-sinon'
import { t } from '../lib/db'
import {
  hashPassword,
  comparePassword,
  register,
  validatePassword,
  requestPasswordReset,
  resetPasswordByToken,
  confirm,
  findUserById
} from './index'
import {
  create as createUserAuthenticationFactory,
  userAuthenticationFactory,
  requestedPasswordReset,
  DUMMY_TOKEN,
  unconfirmed
} from './factories'

const sendMail = sinon.spy()
const withMockedDate = async <T>(date: string, fn: (remock: typeof mockdate.set) => T) => {
  try {
    mockdate.set(date)
    return await fn(mockdate.set)
  } finally {
    mockdate.reset()
  }
}

describe('comparePassword', () => {
  it('returns true when passwords match', async () => {
    const password = 'sepp'
    const passwordHash = await hashPassword(password)
    assertThat(await comparePassword(password, passwordHash), equalTo(true))
  })

  it('returns false when passwords do NOT match', async () => {
    const password = 'sepp'
    const passwordHash = await hashPassword(password)
    assertThat(await comparePassword('other password', passwordHash), equalTo(false))
  })
})

describe('user/register', () => {
  it('when identifier is used twice, returns error', t(async (withinConnection) => {
    await register({ withinConnection, sendMail }, {
      userIdentifier: 'sepp',
      password: 'huber'
    })
    const result = await register({ withinConnection, sendMail }, {
      userIdentifier: 'sepp',
      password: 'huber'
    })
    assertThat(result.body, equalTo('User Identifier already taken'))
  }))

  it('sends a registration email', t(async (withinConnection) => {
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
  it('when token was found, sets confirmationToken to null', t(async (withinConnection) => {
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

  it('when token was NOT found, returns token not found error', t(async (withinConnection) => {
    const auth = await createUserAuthenticationFactory({ withinConnection },
      userAuthenticationFactory.build(unconfirmed))

    const result = await confirm({ withinConnection }, {
      userIdentifier: auth.userIdentifier,
      token: 'unknown token'
    })

    assertThat(result, hasProperties({
      isSuccess: false,
      body: 'Token not found'
    }))
  }))

  it('when user was not found', t(async (withinConnection) => {
    const result = await confirm({ withinConnection }, {
      userIdentifier: 'unknown user',
      token: 'invalid token'
    })

    assertThat(result, hasProperties({
      isSuccess: false,
      body: 'Token not found'
    }))
  }))
})

describe('user/validate', () => {
  it('when passwords match, returns true', t(async (withinConnection) => {
    await register({ withinConnection, sendMail }, {
      userIdentifier: 'sepp',
      password: 'huber'
    })
    assertThat(await validatePassword({ withinConnection }, {
      userIdentifier: 'sepp',
      password: 'huber'
    }), equalTo(true))
  }))

  it('when passwords do NOT match, returns false', t(async (withinConnection) => {
    await register({ withinConnection, sendMail }, {
      userIdentifier: 'sepp',
      password: 'huber'
    })
    assertThat(await validatePassword({ withinConnection }, {
      userIdentifier: 'sepp',
      password: 'huber1'
    }), equalTo(false))
  }))
})

describe('user/requestPasswordReset', () => {
  it('sends a pw reset email', t(async (withinConnection) => {
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

  it('does not send an email on unknown user', t(async (withinConnection) => {
    const sendMail = sinon.spy()
    await requestPasswordReset({ withinConnection, sendMail }, {
      userIdentifier: 'unknown user'
    })
    assertThat(sendMail.callCount, equalTo(0))
  }))

  it('sets passwordResetSentAt', t(async (withinConnection) => {
    return withMockedDate('2000-01-01', async () => {
      await createUserAuthenticationFactory({ withinConnection }, userAuthenticationFactory.build())
      await requestPasswordReset({ withinConnection, sendMail }, {
        userIdentifier: 'sepp'
      })
      return withinConnection(async ({ client }) => {
        const result = await client.query('select * from user_authentication')
        assertThat(result.rows[0], hasProperties({
          passwordResetSentAt: LocalDateTime.from(nativeJs(new Date()))
        }))
      })
    })
  }))
})

describe('user/resetPasswordByToken', () => {
  it('after success, user can sign in with new password', t(async (withinConnection) => {
    const auth = await createUserAuthenticationFactory({ withinConnection },
      userAuthenticationFactory.build(requestedPasswordReset))

    await resetPasswordByToken({ withinConnection }, {
      userIdentifier: auth.userIdentifier,
      token: DUMMY_TOKEN,
      newPassword: 'new password'
    })

    assertThat(await validatePassword({ withinConnection }, {
      userIdentifier: auth.userIdentifier,
      password: 'new password'
    }), equalTo(true))
  }))

  it('after success, relevant attributes are set to null', t(async (withinConnection) => {
    const auth = await createUserAuthenticationFactory({ withinConnection },
      userAuthenticationFactory.build(requestedPasswordReset))

    await resetPasswordByToken({ withinConnection }, {
      userIdentifier: auth.userIdentifier,
      token: DUMMY_TOKEN,
      newPassword: 'new password'
    })

    return withinConnection(async ({ client }) => {
      const result = await client.query('select * from user_authentication')
      assertThat(result.rows[0], hasProperties({
        passwordResetSentAt: null,
        passwordResetToken: null
      }))
    })
  }))

  it('after token expired, pw is not resetted', t(async (withinConnection) => {
    await withMockedDate('2000-01-01', async (remockDate) => {
      const auth = await createUserAuthenticationFactory({ withinConnection },
        userAuthenticationFactory.build({
          ...requestedPasswordReset,
          passwordResetSentAt: LocalDateTime.from(nativeJs(new Date()))
        }))

      remockDate('2000-01-02')

      await resetPasswordByToken({ withinConnection }, {
        userIdentifier: auth.userIdentifier,
        token: DUMMY_TOKEN,
        newPassword: 'new password'
      })

      assertThat(await validatePassword({ withinConnection }, {
        userIdentifier: auth.userIdentifier,
        password: 'new password'
      }), equalTo(false))
    })
  }))
})

describe('findUserById', () => {
  it('when known userId is passed in', t(async (withinConnection) => {
    const auth = await createUserAuthenticationFactory({ withinConnection },
      userAuthenticationFactory.build())

    const result = await withinConnection(({ client }) => {
      return findUserById({ client }, { id: auth.id })
    })
    assertThat(result, hasProperties({
      userIdentifier: equalTo(auth.userIdentifier)
    }))
  }))

  it('when undefined is passed in', t(async (withinConnection) => {
    const auth = await createUserAuthenticationFactory({ withinConnection },
      userAuthenticationFactory.build())

    const result = await withinConnection(({ client }) => {
      return findUserById({ client }, { id: undefined as unknown as string })
    })

    assertThat(result, equalTo(undefined))
  }))
})
