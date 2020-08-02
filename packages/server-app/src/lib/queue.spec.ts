import { t } from '../spec-helpers'
import { publish, subscribe } from './queue'
import { assertThat, equalTo } from 'hamjest'

const buildLazyPromise = () => {
  let resolve: () => void
  const promise = new Promise((_resolve) => { resolve = _resolve }) // eslint-disable-line promise/param-names
  return { resolve: resolve!, promise }
}

describe('queue', () => {
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

// const subscribeUseCase = async <
//   AggregateFromEventCodec extends AnyCodec,
//   DomainEvent extends AggregateFromEventCodec,
// >(useCaseMapper: { config: { event: DomainEvent } }, channel: Channel) => {
//   subscribe('default', (value) => {
//     if (useCaseMapper.config.event.is(value)) {

//     }
//   }, channel)
// }

// describe.only('subscribeUseCase', t(({ channel }) => {
//   it('', () => {
//     const event = v.record({ value: v.number })

//     subscribeUseCase(domainEventToUseCase({
//       event: v.record({ test: v.number }),
//       useCase: someUseCase,
//       mapper: (event) => ({ value: event.test })
//     }), channel)

//     domainEventToUseCase({
//       event: v.record({ test: v.number }),
//       useCase: someUseCase,
//       mapper: (event) => ({ value: event.test })
//     })

//     // subscribeToUseCase({})

//   }))
// })
