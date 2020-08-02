import { t } from '../spec-helpers';
import { publish, subscribe } from './queue';

const buildLazyPromise = () => {
  let resolve: () => void;
  const promise = new Promise((_resolve) => {resolve = _resolve})
  return { resolve: resolve!, promise };
}

describe('queue', () => {
  const QUEUE = 'test'
  it('WHEN published after subscription, subscribes', t(async ({ channel }) => {
    const { resolve, promise } = buildLazyPromise()
    publish(QUEUE, { hallo: 1 }, channel)
    subscribe(QUEUE, resolve, channel)
    await promise
  }))

  it('WHEN published before subscription, subscribes', t(async ({ channel }) => {
    const { resolve, promise } = buildLazyPromise()
    publish(QUEUE, { hallo: 1 }, channel)
    subscribe(QUEUE, resolve, channel)
    await promise
  }))
})