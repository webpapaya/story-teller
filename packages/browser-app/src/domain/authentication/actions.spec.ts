import { allOf, assertThat, equalTo, hasProperties, hasProperty, instanceOf, promiseThat, rejected } from 'hamjest'
import proxyquire from 'proxyquire'
import { stub } from 'sinon'
import { APIError, DecodingError } from '../errors'

const dispatch = stub()
const DUMMY_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNkMDUzNzMzLWFlZDQtNDdiNy1hNDc0LTNhZmM5NjMxYTU2MiIsImVtcGxveWVkSW4iOltdLCJpYXQiOjE2MDkwOTUzNzUsImV4cCI6MTYwOTA5NTY3NX0.a3_18sHK9PZCiJrhtd3LjotPMl4YFOfN-O2IG7ZCeIU'
const DUMMY_PRINCIPAL_ID = '3d053733-aed4-47b7-a474-3afc9631a562'

describe('signIn', () => {
  it('calls sign in route with arguments', async () => {
    const returnValue = { payload: { jwtToken: DUMMY_TOKEN } }
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
    const signInFactory = (args?: { token?: string }) => {
      const returnValue = { payload: { jwtToken: args?.token ?? DUMMY_TOKEN } }
      const fetch = stub().returns(Promise.resolve({
        status: 200,
        json: () => Promise.resolve(returnValue)
      }))

      const actions = proxyquire('./actions', {
        '../fetch': { fetch }
      })
      const signInArgs = { userIdentifier: 'test', password: 'myPassword' }
      const signIn = () => actions.signIn(signInArgs)(dispatch)

      return { returnValue, fetch, signIn, signInArgs }
    }

    it('returns value from API', async () => {
      const { signIn, returnValue } = signInFactory()
      assertThat(await signIn(), equalTo(returnValue))
    })

    it('dispatches USER/SESSION/SUCCESS', async () => {
      const { signIn } = signInFactory()

      await signIn()

      assertThat(dispatch, hasProperty('lastCall.args.0', equalTo({
        type: 'USER/SESSION/SUCCESS',
        payload: {
          id: DUMMY_PRINCIPAL_ID,
          jwtToken: DUMMY_TOKEN
        }
      })))
    })

    it('AND an invalid JWT was returned, throws DecodingError', async () => {
      const { signIn } = signInFactory({ token: 'invalid token' })

      await promiseThat(signIn(), rejected(
        instanceOf(DecodingError)
      ))
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
