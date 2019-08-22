// @ts-ignore
import { assertThat, equalTo, hasProperty, hasProperties } from 'hamjest'
import mockdate from 'mockdate'
import { t, WithinConnection } from '../lib/db'
import {
  hashPassword,
  comparePassword,
  register,
  validatePassword,
  requestPasswordReset,
  resetPasswordByToken
} from './index'
import { LocalDateTime, nativeJs } from 'js-joda'
import sinon from 'ts-sinon'

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
  const registerAndRequestPWReset = async (withinConnection: WithinConnection, sendMail = sinon.spy()) => {
    await register({ withinConnection, sendMail }, {
      userIdentifier: 'sepp',
      password: 'huber'
    })
    return requestPasswordReset({ withinConnection, sendMail }, {
      userIdentifier: 'sepp'
    })
  }

  it('sends a pw reset email', t(async (withinConnection) => {
    const sendMail = sinon.spy()
    await registerAndRequestPWReset(withinConnection, sendMail)
    assertThat(sendMail.lastCall.args[0], hasProperties({
      type: 'PasswordResetRequestEmail',
      to: 'sepp'
    }))
  }))

  it('does not send an email on unknown user', t(async (withinConnection) => {
    const sendMail = sinon.spy()
    await requestPasswordReset({ withinConnection, sendMail }, {
      userIdentifier: 'unknown'
    })
    assertThat(sendMail.callCount, equalTo(0))
  }))

  it('returns token', t(async (withinConnection) => {
    const response = await registerAndRequestPWReset(withinConnection)
    assertThat(response.body, hasProperty('token'))
  }))

  it('sets passwordResetSentAt', t(async (withinConnection) => {
    return withMockedDate('2000-01-01', async () => {
      await registerAndRequestPWReset(withinConnection)
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
  const sendMail = async () => {}
  const resetPassword = async (withinConnection: WithinConnection) => {
    const userIdentifier = 'sepp'
    const newPassword = 'new password'

    await register({ withinConnection, sendMail }, {
      userIdentifier,
      password: 'huber'
    })

    const pwResetResult = await requestPasswordReset({ withinConnection, sendMail }, {
      userIdentifier
    })

    await resetPasswordByToken({ withinConnection }, {
      userIdentifier,
      token: pwResetResult.body.token,
      newPassword
    })

    return { userIdentifier, token: pwResetResult.body.token, newPassword }
  }

  it('after success, user can sign in with new password', t(async (withinConnection) => {
    const { userIdentifier, newPassword } = await resetPassword(withinConnection)
    assertThat(await validatePassword({ withinConnection }, {
      userIdentifier,
      password: newPassword
    }), equalTo(true))
  }))

  it('after success, relevant attributes are set to null', t(async (withinConnection) => {
    await resetPassword(withinConnection)
    return withinConnection(async ({ client }) => {
      const result = await client.query('select * from user_authentication')
      assertThat(result.rows[0], hasProperties({
        passwordResetSentAt: null,
        passwordResetToken: null
      }))
    })
  }))

  it('after token expired, pw is not resetted', t(async (withinConnection) => {
    const sendMail = async () => {}
    const userIdentifier = 'sepp'
    const newPassword = 'new password'
    await register({ withinConnection, sendMail }, {
      userIdentifier,
      password: 'huber'
    })

    await withMockedDate('2000-01-01', async (remockDate) => {
      const result = await requestPasswordReset({ withinConnection, sendMail }, {
        userIdentifier
      })

      remockDate('2000-01-02')

      await resetPasswordByToken({ withinConnection }, {
        userIdentifier,
        token: result.body.token,
        newPassword
      })

      assertThat(await validatePassword({ withinConnection }, {
        userIdentifier,
        password: newPassword
      }), equalTo(false))
    })
  }))
})
