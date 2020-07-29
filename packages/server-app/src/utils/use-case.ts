import { AnyCodec } from '@story-teller/shared'
import deepFreeze from 'deep-freeze'

type EventConfig<
  Event extends AnyCodec,
  Aggregate extends AnyCodec,
  Command extends AnyCodec
> = {
  event: Event
  mapper: ((payload: { aggregateBefore: Aggregate['O'], aggregateAfter: Aggregate['O'], command: Command['O']}) => Event['O'] | undefined)
}

type Events<
  Command extends AnyCodec,
  Aggregate extends AnyCodec,
  Event1 extends AnyCodec,
  Event2 extends AnyCodec,
  Event3 extends AnyCodec,
  Event4 extends AnyCodec,
  Event5 extends AnyCodec,
> = [] | [
  EventConfig<Event1, Aggregate, Command>,
] | [
  EventConfig<Event1, Aggregate, Command>,
  EventConfig<Event2, Aggregate, Command>,
] | [
  EventConfig<Event1, Aggregate, Command>,
  EventConfig<Event2, Aggregate, Command>,
  EventConfig<Event3, Aggregate, Command>,
] | [
  EventConfig<Event1, Aggregate, Command>,
  EventConfig<Event2, Aggregate, Command>,
  EventConfig<Event3, Aggregate, Command>,
  EventConfig<Event4, Aggregate, Command>,
] | [
  EventConfig<Event1, Aggregate, Command>,
  EventConfig<Event2, Aggregate, Command>,
  EventConfig<Event3, Aggregate, Command>,
  EventConfig<Event4, Aggregate, Command>,
  EventConfig<Event5, Aggregate, Command>,
]

export const useCase = <
  Command extends AnyCodec,
  Aggregate extends AnyCodec,
  Event1 extends AnyCodec,
  Event2 extends AnyCodec,
  Event3 extends AnyCodec,
  Event4 extends AnyCodec,
  Event5 extends AnyCodec,
>(config: {
  command: Command
  aggregate: Aggregate
  events: Events<Command, Aggregate, Event1, Event2, Event3, Event4, Event5>,
  preCondition?: (opts: { aggregate: Aggregate['O'], command: Command['O'] }) => boolean
  execute: (opts: { aggregate: Aggregate['O'], command: Command['O'] }) => Aggregate['O']
}) => aggregateFactory({
  ...config,
  aggregateFrom: config.aggregate,
  aggregateTo: config.aggregate
})

export const aggregateFactory = <
  Command extends AnyCodec,
  AggregateFrom extends AnyCodec,
  AggregateTo extends AnyCodec,
  Event1 extends AnyCodec,
  Event2 extends AnyCodec,
  Event3 extends AnyCodec,
  Event4 extends AnyCodec,
  Event5 extends AnyCodec,
>(config: {
  command: Command
  aggregateFrom: AggregateFrom
  aggregateTo: AggregateTo
  events: Events<Command, AggregateTo, Event1, Event2, Event3, Event4, Event5>,
  preCondition?: (opts: { aggregate: AggregateFrom['O'], command: Command['O'] }) => boolean
  execute: (opts: { aggregate: AggregateFrom['O'], command: Command['O'] }) => AggregateTo['O']
}) => ({
  config: {
    command: config.command,
    aggregateFrom: config.aggregateFrom,
    aggregateTo: config.aggregateTo,
    events: config.events
  },
  run: (
    payload: {
      command: Command['O']
      aggregate: AggregateFrom['O']
    }
  ): [AggregateFrom['O'], Array<typeof config.events[number]['event']>] => {
    if (!config.command.is(payload.command)) {
      throw new Error('Invalid Command')
    }

    if (!config.aggregateFrom.is(payload.aggregate)) {
      throw new Error('Invalid Aggregate')
    }

    if (config.preCondition && !config.preCondition(payload)) {
      throw new Error('Invalid Precondition')
    }

    const updatedAggregate = config.execute(deepFreeze(payload))

    if (!config.aggregateTo.is(updatedAggregate)) {
      throw new Error('Aggregate invalid after use case')
    }

    const events: Array<Event1 | Event2 | Event3 | Event4 | Event5> = []
    if (config.events) {
      config.events
      // @ts-ignore
        .forEach((eventConfig) => {
          const mappedEvent = eventConfig.mapper({
              aggregateBefore: payload.aggregate,
              aggregateAfter: updatedAggregate,
              command: payload.command
          })
          if (mappedEvent && eventConfig.event.is(mappedEvent)) {
            events.push(mappedEvent)
          }
          return events
        })
    }

    return [updatedAggregate, events]
  }
})

export const domainEventToUseCase = <
  AggregateFromEventCodec extends AnyCodec,
  AggregateFromUseCaseCodec extends AnyCodec,
  AggregateFromEvent extends AggregateFromEventCodec['O'],
  AggregateFromUseCase extends AggregateFromUseCaseCodec['O'],
  DomainEvent extends { aggregate: AggregateFromEventCodec },
  Mapper extends (aggregateFromEvent: DomainEvent['aggregate']['O']) => Command,
  Command,
>(config: {
  event: DomainEvent
  useCase: { run: (payload: { aggregate: AggregateFromUseCase, command: Command }) => [AggregateFromUseCase, unknown] }
  mapper: Mapper
}) => (payload: {
  event: { aggregate: AggregateFromEvent }
  aggregate: AggregateFromUseCase
}) => {
  const command = config.mapper(payload.event.aggregate)
  return config.useCase.run({ aggregate: payload.aggregate, command })
}
