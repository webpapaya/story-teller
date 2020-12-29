import { assertThat, hasProperties, hasProperty, string } from 'hamjest'
import proxyquire from 'proxyquire'
import { stub } from 'sinon'

describe('createCompany', () => {
  it('calls create company route with arguments', async () => {
    const dispatch = stub()
    const fetch = stub().returns(Promise.resolve({
      status: 200,
      json: () => Promise.resolve()
    }))
    const { createCompany } = proxyquire('./actions', {
      '../fetch': { fetch }
    })
    const params = { name: 'hallo' }

    await createCompany(params)(dispatch)

    assertThat(fetch, hasProperty('lastCall.args', hasProperties({
      0: 'company',
      1: hasProperties({
        method: 'POST',
        rawBody: hasProperties({
          id: string(),
          name: params.name
        })
      })
    })))
  })
})
