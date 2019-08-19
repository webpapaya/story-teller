// @ts-ignore
import { assertThat, equalTo } from 'hamjest'
import { t } from '../lib/db'
import {
  hashPassword,
  comparePassword,
  register,
  validatePassword
} from './index'

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
      userIdentifer: 'sepp',
      password: 'huber'
    });
    assertThat(await validatePassword({ withinConnection }, {
      userIdentifer: 'sepp',
      password: 'huber'
    }), equalTo(true));
  }))

  it('when passwords do NOT match, returns false', t(async (withinConnection) => {
    await register({ withinConnection }, {
      userIdentifer: 'sepp',
      password: 'huber'
    });
    assertThat(await validatePassword({ withinConnection }, {
      userIdentifer: 'sepp',
      password: 'huber1'
    }), equalTo(false));
  }))
})
