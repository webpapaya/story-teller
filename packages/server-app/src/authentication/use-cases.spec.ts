import { v4 as uuid } from 'uuid'
import { signIn, signUp, requestPasswordReset } from './use-cases'
import jsonwebtoken from 'jsonwebtoken'
import { assertThat, contains, hasProperties, hasProperty, throws } from 'hamjest'
import { userAuthentication } from './domain'
import { hasEvents } from '../utils/custom-matcher'

describe('signUp', () => {
  it('returns a new userAuthentication', () => {
    const command = {
      id: uuid(),
      userIdentifier: 'irrelevant@test.com',
      password: 'password'
    }
    const [userAuthentication] = signUp.run({
      command,
      aggregate: undefined
    })

    assertThat(userAuthentication, hasProperties({
      id: command.id,
      userIdentifier: command.userIdentifier
    }))
  })

  it('emits a userRegistered event', () => {
    const command = {
      id: uuid(),
      userIdentifier: 'irrelevant@test.com',
      password: 'password'
    }
    const [, events] = signUp.run({
      command,
      aggregate: undefined
    })

    assertThat(events,
      contains(hasProperty('name', 'userRegistered')))
  })
})

describe('signIn', () => {
  const userId = uuid()
  const userIdentifier = 'userIdentifier@test.com'
  const password = 'password'

  const principal = {
    id: userId,
    employedIn: []
  }

  const [userAuthentication] = signUp.run({
    command: { id: userId, userIdentifier, password },
    aggregate: undefined
  })

  describe('WHEN passwords match', () => {
    it('returns signed JWT token', () => {
      const [{ jwtToken }] = signIn.run({
        command: { userIdentifier, password },
        aggregate: {
          principal: {
            id: userId,
            employedIn: []
          },
          userAuthentication
        }
      })

      assertThat(jsonwebtoken.decode(jwtToken),
        hasProperties(principal))
    })

    it('returns refreshToken', () => {
      const [{ refreshToken }] = signIn.run({
        command: { userIdentifier, password },
        aggregate: {
          principal: {
            id: userId,
            employedIn: []
          },
          userAuthentication
        }
      })

      assertThat(refreshToken, hasProperty('token.state', 'active'))
    })
  })

  describe('WHEN passwords do NOT match', () => {
    it('throws error', () => {
      assertThat(() => {
        signIn.run({
          command: { userIdentifier, password: 'wrong password' },
          aggregate: {
            principal: {
              id: userId,
              employedIn: []
            },
            userAuthentication
          }
        })
      }, throws())
    })
  })
})

describe('requestPasswordReset', () => {
  it('sends a passwordResetRequested event', () => {
    const result = requestPasswordReset.run({
      command: {
        userIdentifier: 'irrelevant'
      },
      aggregate: userAuthentication.build()[0]()
    })

    assertThat(result, hasEvents(
      hasProperty('0.name', 'passwordResetRequested')))
  })
})
