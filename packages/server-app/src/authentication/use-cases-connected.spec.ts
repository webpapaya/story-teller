import { fulfilled, promiseThat } from 'hamjest'
import { v4 } from 'uuid'
import { t } from '../spec-helpers'
import {
  signIn,
  register,
  confirmAccount,
  requestPasswordReset,
  resetPasswordByToken
} from './use-cases-connected'

describe.only('authentication flow', () => {
  describe('after successful sign up', () => {
    const credentials = {
      id: v4(),
      userIdentifier: 'test@test.at',
      password: 'secret'
    }

    it('sign-in works', t(async (clients) => {
      await register.raw(credentials, clients)
      await promiseThat(signIn.raw(credentials, clients), fulfilled())
    }))

    describe('after password was reset', () => {
      it('sign in works with new password', t(async (clients) => {
        await register.raw(credentials, clients)
        const [aggregateFromRequest] = await requestPasswordReset
          .raw({ id: credentials.id }, clients)

        if (aggregateFromRequest.passwordReset.state !== 'active') {
          throw new Error('Token State needs to be active')
        }

        await resetPasswordByToken.raw({
          id: aggregateFromRequest.id,
          token: aggregateFromRequest.passwordReset.plainToken!,
          password: 'changed'
        }, clients)

        await promiseThat(signIn.raw({
          ...credentials,
          password: 'changed'
        }, clients), fulfilled())
      }))
    })

    it('confirmation of account works', t(async (clients) => {
      const [aggregate] = await register.raw(credentials, clients)

      if (aggregate.confirmation.state !== 'active') {
        throw new Error('Token State needs to be active')
      }

      await promiseThat(confirmAccount.raw(
        {
          token: aggregate.confirmation.plainToken!,
          id: aggregate.id
        },
        clients
      ), fulfilled())
    }))
  })
})
