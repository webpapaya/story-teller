import { allOf, assertThat, equalTo, hasProperties, hasProperty, instanceOf, promiseThat, rejected } from 'hamjest'
import proxyquire from 'proxyquire'
import { stub } from 'sinon'
import { APIError } from '../errors'

const dispatch = () => {} // eslint-disable-line @typescript-eslint/no-empty-function

describe('signIn', () => {
  it('calls sign in route with arguments', async () => {
    const returnValue = { payload: { jwtToken: 'token' } }
    const fetch = stub().returns(Promise.resolve({
      status: 200,
      json: () => Promise.resolve(returnValue)
    }))
    const { signIn } = proxyquire('./actions', {
      '../fetch': { fetch }
    })
    const signInArgs = { userIdentifier: 'test', password: 'myPassword' }

    await signIn(signInArgs)(dispatch)

    assertThat(fetch, hasProperty('lastCall.args', hasProperties({
      0: 'authentication/sign-in',
      1: hasProperties({
        body: JSON.stringify(signInArgs)
      })
    })))
  })

  describe('when status was 200', () => {
    it('returns value from API', async () => {
      const returnValue = { payload: { jwtToken: 'token' } }
      const fetch = stub().returns(Promise.resolve({
        status: 200,
        json: () => Promise.resolve(returnValue)
      }))
      const setAuthenticationToken = stub()

      const { signIn } = proxyquire('./actions', {
        '../fetch': { fetch, setAuthenticationToken }
      })
      const signInArgs = { userIdentifier: 'test', password: 'myPassword' }
      const actionResult = await signIn(signInArgs)(dispatch)

      assertThat(actionResult, equalTo(returnValue))
    })

    it('sets jwtToken', async () => {
      const returnValue = { payload: { jwtToken: 'token' } }
      const fetch = stub().returns(Promise.resolve({
        status: 200,
        json: () => Promise.resolve(returnValue)
      }))
      const setAuthenticationToken = stub()

      const { signIn } = proxyquire('./actions', {
        '../fetch': { fetch, setAuthenticationToken }
      })
      const signInArgs = { userIdentifier: 'test', password: 'myPassword' }
      await signIn(signInArgs)(dispatch)

      assertThat(setAuthenticationToken, hasProperty('lastCall.args.0', returnValue.payload.jwtToken))
    })
  })

  it('WHEN status was not 200, throws API error', async () => {
    const returnValue = { payload: { jwtToken: 'token' } }
    const fetch = stub().returns(Promise.resolve({
      status: 400,
      json: () => Promise.resolve({ message: returnValue })
    }))

    const { signIn } = proxyquire('./actions', {
      '../fetch': { fetch }
    })
    const signInArgs = { userIdentifier: 'test', password: 'myPassword' }

    await promiseThat(signIn(signInArgs)(dispatch), rejected(allOf(
      instanceOf(APIError),
      hasProperty('message', returnValue)
    )))
  })
})

describe('signUp', () => {
  it('calls sign in route with arguments', async () => {
    const fetch = stub().returns(Promise.resolve({
      status: 200,
      json: () => Promise.resolve()
    }))
    const { signUp } = proxyquire('./actions', {
      '../fetch': { fetch }
    })
    const params = { userIdentifier: 'test', password: 'myPassword' }

    await signUp(params)(dispatch)

    assertThat(fetch, hasProperty('lastCall.args', hasProperties({
      0: 'authentication/sign-up'
    })))
  })

  it('WHEN status was 200, returns value from API', async () => {
    const returnValue = 'irrelevant'
    const fetch = stub().returns(Promise.resolve({
      status: 200,
      json: () => Promise.resolve(returnValue)
    }))

    const { signUp } = proxyquire('./actions', {
      '../fetch': { fetch }
    })
    const signInArgs = { userIdentifier: 'test', password: 'myPassword' }
    const actionResult = await signUp(signInArgs)(dispatch)

    assertThat(actionResult, equalTo(returnValue))
  })

  it('WHEN status was other than 200, throws API error', async () => {
    const returnValue = 'irrelevant'
    const fetch = stub().returns(Promise.resolve({
      status: 400,
      json: () => Promise.resolve({ message: returnValue })
    }))

    const { signUp } = proxyquire('./actions', {
      '../fetch': { fetch }
    })
    const signInArgs = { userIdentifier: 'test', password: 'myPassword' }

    await promiseThat(signUp(signInArgs)(dispatch), rejected(allOf(
      instanceOf(APIError),
      hasProperty('message', returnValue)
    )))
  })
})

describe('requestPasswordReset', () => {
  it('calls request-password-reset with given parameters', () => {
    const returnValue = 'irrelevant'
    const fetch = stub().returns(Promise.resolve({
      status: 200,
      json: () => Promise.resolve(returnValue)
    }))

    const { requestPasswordReset } = proxyquire('./actions', {
      '../fetch': { fetch }
    })
    const payload = { userIdentifier: 'irrelevant' }

    requestPasswordReset(payload)(dispatch)
    assertThat(fetch, hasProperty('lastCall.args', hasProperties({
      0: 'authentication/request-password-reset',
      1: hasProperties({
        body: JSON.stringify(payload)
      })
    })))
  })
})

describe('resetPassword', () => {
  it('calls reset-password with given parameters', () => {
    const returnValue = 'irrelevant'
    const fetch = stub().returns(Promise.resolve({
      status: 200,
      json: () => Promise.resolve(returnValue)
    }))

    const { resetPassword } = proxyquire('./actions', {
      '../fetch': { fetch }
    })
    const payload = { userIdentifier: 'irrelevant' }

    resetPassword(payload)(dispatch)
    assertThat(fetch, hasProperty('lastCall.args', hasProperties({
      0: 'authentication/reset-password',
      1: hasProperties({
        body: JSON.stringify(payload)
      })
    })))
  })
})
