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
  it('when passwords match, returns true', t(async (withinConnection) => {
    await register({ withinConnection }, {
      userIdentifier: 'sepp',
      password: 'huber'
    })
    assertThat(await validatePassword({ withinConnection }, {
      userIdentifier: 'sepp',
      password: 'huber'
    }), equalTo(true))
  }))

  it('when passwords do NOT match, returns false', t(async (withinConnection) => {
    await register({ withinConnection }, {
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
  const registerAndRequestPWReset = async (withinConnection: WithinConnection) => {
    await register({ withinConnection }, {
      userIdentifier: 'sepp',
      password: 'huber'
    })
    return requestPasswordReset({ withinConnection }, {
      userIdentifier: 'sepp'
    })
  }

  it('returns token', t(async (withinConnection) => {
    const response = await registerAndRequestPWReset(withinConnection)
    assertThat(response, hasProperty('token'))
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
  const resetPassword = async (withinConnection: WithinConnection) => {
    const userIdentifier = 'sepp'
    const newPassword = 'new password'

    await register({ withinConnection }, {
      userIdentifier,
      password: 'huber'
    })

    const { token } = await requestPasswordReset({ withinConnection }, {
      userIdentifier
    })

    await resetPasswordByToken({ withinConnection }, {
      userIdentifier,
      token,
      newPassword
    })

    return { userIdentifier, token, newPassword }
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
    const userIdentifier = 'sepp'
    const newPassword = 'new password'
    await register({ withinConnection }, {
      userIdentifier,
      password: 'huber'
    })

    await withMockedDate('2000-01-01', async (remockDate) => {
      const { token } = await requestPasswordReset({ withinConnection }, {
        userIdentifier
      })

      remockDate('2000-01-02')

      await resetPasswordByToken({ withinConnection }, {
        userIdentifier,
        token,
        newPassword
      })

      assertThat(await validatePassword({ withinConnection }, {
        userIdentifier,
        password: newPassword
      }), equalTo(false))
    })
  }))
})
