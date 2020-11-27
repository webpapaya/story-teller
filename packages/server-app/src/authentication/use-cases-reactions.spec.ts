import { assertThat, hasProperties, hasProperty } from 'hamjest'
import sinon from 'sinon'
import { userAuthentication } from './domain'
import { reactToUserRegistered } from './use-cases-reactions'

describe('sends email', () => {
  it('calls sendMail correctly', async () => {
    const auth = userAuthentication.build()[0]()
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
