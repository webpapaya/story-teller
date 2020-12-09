import { allOf, assertThat, equalTo, hasProperties, hasProperty, instanceOf, promiseThat, rejected } from 'hamjest'
import proxyquire from 'proxyquire'
import { stub } from 'sinon'
import { APIError } from '../errors'

describe('signIn', () => {
  const dispatch = () => {} // eslint-disable-line @typescript-eslint/no-empty-function

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
      0: '/authentication/sign-in',
      1: hasProperties({
        body: JSON.stringify(signInArgs)
      })
    })))
  })

  it('WHEN status was successful, returns value from API', async () => {
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

  it('WHEN status was not 100, throws API error', async () => {
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
