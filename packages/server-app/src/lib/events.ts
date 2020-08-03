import { AnyCodec } from '@story-teller/shared'
import { EventEmitter } from 'events'
const DEFAULT_EVENT_EMITTER = new EventEmitter()

export const listenToEvents = <Codec extends AnyCodec>(
  eventName: string,
  codec: Codec,
  fn: (args: Codec['A']) => unknown | Promise<unknown>,
  eventEmitter: EventEmitter = DEFAULT_EVENT_EMITTER
) => {
  eventEmitter.on(eventName, (data: any) => {
    if (codec.is(data)) {
      fn(data)
    }
  })
}

export const emitEvent = (
  eventName: string,
  payload: any,
  eventEmitter: EventEmitter = DEFAULT_EVENT_EMITTER
) => {
  eventEmitter.emit(eventName, payload)
}

export const buildEvent = <EventName extends Readonly<string>, Payload extends AnyCodec>(eventName: EventName, payload: Payload) => ({
  name: eventName,
  payload
})
