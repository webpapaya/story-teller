import { assertThat, hasProperties, hasProperty } from 'hamjest'
import sinon from 'sinon'
import { userAuthentication } from './domain'
import { reactToUserRegistered } from './use-cases-reactions'

describe('reactToUserRegistered', () => {
  it('calls sendMail correctly', async () => {
    const auth = userAuthentication.build()
      .map((fn) => fn())
      .find((userAuthentication) => userAuthentication.confirmation.state === 'active')!

    const sendMail = sinon.spy()
    const userIdentifier = 'test@test.com'

    await reactToUserRegistered.execute({
      userAuthentication: { ...auth, userIdentifier }
    }, {
      pgClient: {} as any,
      channel: {} as any,
      sendMail
    })

    assertThat(sendMail, hasProperty('lastCall.args.0', hasProperties({
      to: userIdentifier
    })))
  })
})
