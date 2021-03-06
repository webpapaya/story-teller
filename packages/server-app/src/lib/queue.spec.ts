// eslint-disable @typescript-eslint/no-floating-promises
import { t } from '../spec-helpers'
import { publish, subscribe } from './queue'
import { assertThat, equalTo } from 'hamjest'
import { buildLazyPromise } from '../utils/build-lazy-promise'

describe.skip('queue', () => {
  const QUEUE = 'test'
  const MESSAGE = { hallo: 1 } as const
  it('WHEN published after subscription, subscribes', t(async ({ channel }) => {
    const { resolve, promise } = buildLazyPromise()
    publish(QUEUE, MESSAGE, channel)
    subscribe(QUEUE, resolve, channel)
    await promise
  }))

  it('WHEN published before subscription, subscribes', t(async ({ channel }) => {
    const { resolve, promise } = buildLazyPromise()
    publish(QUEUE, MESSAGE, channel)
    subscribe(QUEUE, resolve, channel)
    await promise
  }))

  it('automatically parses JSON input', t(async ({ channel }) => {
    const { resolve, promise } = buildLazyPromise()
    publish(QUEUE, MESSAGE, channel)
    subscribe(QUEUE, (response) => {
      assertThat(response, equalTo(MESSAGE))
      resolve()
    }, channel)
    await promise
  }))
})
