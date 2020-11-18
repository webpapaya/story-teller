import { authenticationToken } from '../domain'
import { assertDifference, t } from '../../spec-helpers'
import * as refreshTokenRepository from './index'
import { assertThat, equalTo, promiseThat, rejected } from 'hamjest'
import { sequentially } from '../../utils/sequentially'

const tokens = authenticationToken.build()
  .map((factory) => factory())

describe('ensure', () => {
  it('WHEN token is active, stores it', t(async (clients) => {
    const activeTokens = tokens
      .filter((authToken) => authToken.token.state === 'active')

    await sequentially(activeTokens.map((token) => async () => {
      await assertDifference(clients, 'refresh_token', 1, async () => {
        await refreshTokenRepository.ensure(token, clients)
      })
    }))
  }))

  it('WHEN token is inactive, does not create token', t(async (clients) => {
    const inactiveTokens = tokens
      .filter((authToken) => authToken.token.state === 'inactive')

    await sequentially(inactiveTokens.map((token) => async () => {
      await assertDifference(clients, 'refresh_token', 0, async () => {
        await promiseThat(refreshTokenRepository.ensure(token, clients), rejected())
      })
    }))
  }))
})

describe('where', () => {
  it('finds active token', t(async (clients) => {
    const activeTokens = tokens
      .filter((authToken) => authToken.token.state === 'active')

    await sequentially(activeTokens.map((token) => async () => {
      await refreshTokenRepository.ensure(token, clients)
      const refreshToken = await refreshTokenRepository
        .where({ id: token.id, userId: token.userId }, clients)

      assertThat(JSON.parse(JSON.stringify(refreshToken)),
        equalTo(JSON.parse(JSON.stringify(refreshToken))))
    }))
  }))
})
