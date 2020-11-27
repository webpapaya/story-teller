// import {
//   assertThat,
//   equalTo,
//   hasProperties,
//   everyItem,
//   truthy as present
// // @ts-ignore
// } from 'hamjest'
// import { LocalDateTime, nativeJs } from 'js-joda'
// import sinon from 'ts-sinon'
// import {
//   register,
//   requestPasswordReset,
//   resetPasswordByToken,
// } from './use-cases'
// import {
//   create as createUserAuthenticationFactory,
//   userAuthenticationFactory,
//   requestedPasswordReset,
//   DUMMY_TOKEN,
//   unconfirmed
// } from './factories'
// import { findUserByAuthentication } from './queries'
// import { withMockedDate, t } from '../spec-helpers'
// import { Err } from 'space-lift'

import { v4 as uuid } from 'uuid'
import { signIn, signUp } from './use-cases'
import jsonwebtoken from 'jsonwebtoken'
import { anyOf, assertThat, contains, hasProperties, hasProperty, throws } from 'hamjest'

// const sendMail = sinon.spy()

// describe('user/register', () => {
//   it('when identifier is used twice, returns error', t(async ({ client }) => {
//     await register({ client, sendMail }, {
//       userIdentifier: 'sepp',
//       password: 'huber'
//     })
//     const result = await register({ client, sendMail }, {
//       userIdentifier: 'sepp',
//       password: 'huber'
//     })
//     assertThat(result, equalTo(Err('User Identifier already taken')))
//   }))

//   it('sends a registration email', t(async ({ client }) => {
//     const sendMail = sinon.spy()
//     await register({ client, sendMail }, {
//       userIdentifier: 'sepp',
//       password: 'huber'
//     })

//     assertThat(sendMail.lastCall.args[0], hasProperties({
//       type: 'RegisterEmail',
//       to: 'sepp'
//     }))
//   }))
// })

// describe('user/confirm', () => {
//   it('when token was found, sets confirmationToken to null', t(async ({ client }) => {
//     const auth = await createUserAuthenticationFactory({ client },
//       userAuthenticationFactory.build(unconfirmed))

//     await confirm({ client }, {
//       userIdentifier: auth.userIdentifier,
//       token: DUMMY_TOKEN
//     })

//     const result = await client.query('select * from user_authentication')
//     assertThat(result.rows, everyItem(hasProperties({
//       confirmationToken: null,
//       confirmedAt: present()
//     })))
//   }))

//   it('when token was NOT found, returns token not found error', t(async ({ client }) => {
//     const auth = await createUserAuthenticationFactory({ client },
//       userAuthenticationFactory.build(unconfirmed))

//     const result = await confirm({ client }, {
//       userIdentifier: auth.userIdentifier,
//       token: 'unknown token'
//     })

//     assertThat(result, equalTo(Err('NOT_FOUND')))
//   }))

//   it('when user was not found', t(async ({ client }) => {
//     const result = await confirm({ client }, {
//       userIdentifier: 'unknown user',
//       token: 'invalid token'
//     })

//     assertThat(result, equalTo(Err('NOT_FOUND')))
//   }))
// })

// describe('user/requestPasswordReset', () => {
//   it('sends a pw reset email', t(async ({ client }) => {
//     const sendMail = sinon.spy()
//     await createUserAuthenticationFactory({ client }, userAuthenticationFactory.build())
//     await requestPasswordReset({ client, sendMail }, {
//       userIdentifier: 'sepp'
//     })
//     assertThat(sendMail.lastCall.args[0], hasProperties({
//       type: 'PasswordResetRequestEmail',
//       to: 'sepp'
//     }))
//   }))

//   it('does not send an email on unknown user', t(async ({ client }) => {
//     const sendMail = sinon.spy()
//     await requestPasswordReset({ client, sendMail }, {
//       userIdentifier: 'unknown user'
//     })
//     assertThat(sendMail.callCount, equalTo(0))
//   }))

//   it('sets passwordResetCreatedAt', t(async ({ client }) => {
//     return withMockedDate('2000-01-01', async () => {
//       await createUserAuthenticationFactory({ client }, userAuthenticationFactory.build())
//       await requestPasswordReset({ client, sendMail }, {
//         userIdentifier: 'sepp'
//       })

//       const result = await client.query('select * from user_authentication')
//       assertThat(result.rows[0], hasProperties({
//         passwordResetCreatedAt: LocalDateTime.from(nativeJs(new Date()))
//       }))
//     })
//   }))
// })

// describe('user/resetPasswordByToken', () => {
//   it('after success, user can sign in with new password', t(async ({ client }) => {
//     const auth = await createUserAuthenticationFactory({ client },
//       userAuthenticationFactory.build(requestedPasswordReset))

//     await resetPasswordByToken({ client }, {
//       userIdentifier: auth.userIdentifier,
//       token: DUMMY_TOKEN,
//       password: 'new password'
//     })

//     assertThat(await findUserByAuthentication({ client }, {
//       userIdentifier: auth.userIdentifier,
//       password: 'new password'
//     }), present())
//   }))

//   it('after success, relevant attributes are set to null', t(async ({ client }) => {
//     const auth = await createUserAuthenticationFactory({ client },
//       userAuthenticationFactory.build(requestedPasswordReset))

//     await resetPasswordByToken({ client }, {
//       userIdentifier: auth.userIdentifier,
//       token: DUMMY_TOKEN,
//       password: 'new password'
//     })

//     const result = await client.query('select * from user_authentication')
//     assertThat(result.rows[0], hasProperties({
//       passwordResetCreatedAt: null,
//       passwordResetToken: null,
//       passwordChangedAt: present()
//     }))
//   }))

//   it('after token expired, pw is not resetted', t(async ({ client }) => {
//     await withMockedDate('2000-01-01', async (remockDate) => {
//       const auth = await createUserAuthenticationFactory({ client },
//         userAuthenticationFactory.build({
//           ...requestedPasswordReset,
//           passwordResetCreatedAt: LocalDateTime.from(nativeJs(new Date()))
//         }))

//       remockDate('2000-01-02')

//       await resetPasswordByToken({ client }, {
//         userIdentifier: auth.userIdentifier,
//         token: DUMMY_TOKEN,
//         password: 'new password'
//       })

//       assertThat(await findUserByAuthentication({ client }, {
//         userIdentifier: auth.userIdentifier,
//         password: 'new password'
//       }), equalTo(Err('NOT_FOUND')))
//     })
//   }))
// })

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
