import { t } from '../spec-helpers';

const buildLazyPromise = () => {
  let resolve: () => void;
  const promise = new Promise((_resolve) => {resolve = _resolve})
  return { resolve: resolve!, promise };
}

describe('queue', () => {
  const QUEUE_NAME = 'irrelevant' as const
  it('WHEN published after subscription, subscribes', t(async ({ queue }) => {
    const { resolve, promise } = buildLazyPromise()
    queue.subscribe(QUEUE_NAME, () => resolve())
    await queue.publish({ name: QUEUE_NAME, data: {} })
  }))

  it('WHEN published before subscription, subscribes', t(async ({ queue }) => {
    const { resolve, promise } = buildLazyPromise()
    await queue.publish({ name: QUEUE_NAME, data: {} })
    queue.subscribe(QUEUE_NAME, () => resolve())
  }))
})