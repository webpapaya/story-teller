import { allOf, assertThat, equalTo, hasProperties, hasProperty, instanceOf, promiseThat, rejected } from 'hamjest'
import proxyquire from 'proxyquire'
import { stub } from 'sinon'
import { APIError } from '../errors'

const dispatch = () => {} // eslint-disable-line @typescript-eslint/no-empty-function

describe('signIn', () => {
  it('calls sign in route with arguments', async () => {
    const fetch = stub().returns(Promise.resolve({
      status: 200,
      json: () => Promise.resolve()
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

  it('WHEN status was 200, returns value from API', async () => {
    const returnValue = 'irrelevant'
    const fetch = stub().returns(Promise.resolve({
      status: 200,
      json: () => Promise.resolve(returnValue)
    }))

    const { signIn } = proxyquire('./actions', {
      '../fetch': { fetch }
    })
    const signInArgs = { userIdentifier: 'test', password: 'myPassword' }
    const actionResult = await signIn(signInArgs)(dispatch)

    assertThat(actionResult, equalTo(returnValue))
  })

  it('WHEN status was not 200, throws API error', async () => {
    const returnValue = 'irrelevant'
    const fetch = stub().returns(Promise.resolve({
      status: 400,
      json: () => Promise.resolve(returnValue)
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
      json: () => Promise.resolve(returnValue)
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
