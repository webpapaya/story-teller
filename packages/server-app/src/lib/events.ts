import { AnyCodec } from '@story-teller/shared'
import { EventEmitter } from 'events'
const DEFAULT_EVENT_EMITTER = new EventEmitter()

const listenToEvents = <Codec extends AnyCodec>(
  eventName: string,
  codec: Codec,
  fn: (args: Codec['A']) => unknown | Promise<unknown>,
  eventEmitter: EventEmitter = DEFAULT_EVENT_EMITTER
) => {
  eventEmitter.on(eventName, (data: any) => {
    if(codec.is(data)) {
      fn(data)
    }
  })
}

const emitEvent = (
  eventName: string,
  payload: any,
  eventEmitter: EventEmitter = DEFAULT_EVENT_EMITTER
) => {
  eventEmitter.emit(eventName, payload)
}