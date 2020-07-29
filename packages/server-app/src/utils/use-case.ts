import { AnyCodec } from '@story-teller/shared'
import deepFreeze from 'deep-freeze'

type EventConfig<
  Event extends AnyCodec,
  Aggregate extends AnyCodec,
  Action extends AnyCodec
> = {
  event: Event
  mapper: ((payload: { aggregateBefore: Aggregate['O'], aggregateAfter: Aggregate['O'], action: Action['O']}) => Event['O'] | undefined)
}

type Events<
  Action extends AnyCodec,
  Aggregate extends AnyCodec,
  Event1 extends AnyCodec,
  Event2 extends AnyCodec,
  Event3 extends AnyCodec,
  Event4 extends AnyCodec,
  Event5 extends AnyCodec,
> = [] | [
  EventConfig<Event1, Aggregate, Action>,
] | [
  EventConfig<Event1, Aggregate, Action>,
  EventConfig<Event2, Aggregate, Action>,
] | [
  EventConfig<Event1, Aggregate, Action>,
  EventConfig<Event2, Aggregate, Action>,
  EventConfig<Event3, Aggregate, Action>,
] | [
  EventConfig<Event1, Aggregate, Action>,
  EventConfig<Event2, Aggregate, Action>,
  EventConfig<Event3, Aggregate, Action>,
  EventConfig<Event4, Aggregate, Action>,
] | [
  EventConfig<Event1, Aggregate, Action>,
  EventConfig<Event2, Aggregate, Action>,
  EventConfig<Event3, Aggregate, Action>,
  EventConfig<Event4, Aggregate, Action>,
  EventConfig<Event5, Aggregate, Action>,
]

type UseCaseConfig<
  Action extends AnyCodec,
  Aggregate extends AnyCodec,
  Event1 extends AnyCodec,
  Event2 extends AnyCodec,
  Event3 extends AnyCodec,
  Event4 extends AnyCodec,
  Event5 extends AnyCodec,
> = {
  action: Action
  aggregate: Aggregate
  events: Events<Action, Aggregate, Event1, Event2, Event3, Event4, Event5>
}

export const useCase = <
  Action extends AnyCodec,
  Aggregate extends AnyCodec,
  Event1 extends AnyCodec,
  Event2 extends AnyCodec,
  Event3 extends AnyCodec,
  Event4 extends AnyCodec,
  Event5 extends AnyCodec,
>(config: UseCaseConfig<Action, Aggregate, Event1, Event2, Event3, Event4, Event5> & {
  preCondition?: (opts: { aggregate: Aggregate['O'], action: Action['O'] }) => boolean
  execute: (opts: { aggregate: Aggregate['O'], action: Action['O'] }) => Aggregate['O']
}) => aggregateFactory({
  ...config,
  aggregateFrom: config.aggregate,
  aggregateTo: config.aggregate
})

type AggregateFactoryConfig<
  Action extends AnyCodec,
  AggregateFrom extends AnyCodec,
  AggregateTo extends AnyCodec,
  Event1 extends AnyCodec,
  Event2 extends AnyCodec,
  Event3 extends AnyCodec,
  Event4 extends AnyCodec,
  Event5 extends AnyCodec,
> = {
  action: Action
  aggregateFrom: AggregateFrom
  aggregateTo: AggregateTo
  events: Events<Action, AggregateTo, Event1, Event2, Event3, Event4, Event5>
}

export const aggregateFactory = <
  Action extends AnyCodec,
  AggregateFrom extends AnyCodec,
  AggregateTo extends AnyCodec,
  Event1 extends AnyCodec,
  Event2 extends AnyCodec,
  Event3 extends AnyCodec,
  Event4 extends AnyCodec,
  Event5 extends AnyCodec,
>(config: AggregateFactoryConfig<Action, AggregateFrom, AggregateTo, Event1, Event2, Event3, Event4, Event5> & {
  preCondition?: (opts: { aggregate: AggregateFrom['O'], action: Action['O'] }) => boolean
  execute: (opts: { aggregate: AggregateFrom['O'], action: Action['O'] }) => AggregateTo['O']
}) => ({
  config: {
    action: config.action,
    aggregateFrom: config.aggregateFrom,
    aggregateTo: config.aggregateTo,
    events: config.events
  },
  run: (
    payload: {
      action: Action['O']
      aggregate: AggregateFrom['O']
    }
  ): [AggregateFrom['O'], Array<typeof config.events[number]['event']>] => {
    if (!config.action.is(payload.action)) {
      throw new Error('Invalid Action')
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
              action: payload.action
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
  Mapper extends (aggregateFromEvent: DomainEvent['aggregate']['O']) => Action,
  Action,
>(config: {
  event: DomainEvent
  useCase: { run: (payload: { aggregate: AggregateFromUseCase, action: Action }) => [AggregateFromUseCase, unknown] }
  mapper: Mapper
}) => (payload: {
  event: { aggregate: AggregateFromEvent }
  aggregate: AggregateFromUseCase
}) => {
  const action = config.mapper(payload.event.aggregate)
  return config.useCase.run({ aggregate: payload.aggregate, action })
}
