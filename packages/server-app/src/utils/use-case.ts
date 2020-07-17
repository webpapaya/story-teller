import { AnyCodec } from '@story-teller/shared'
import deepFreeze from 'deep-freeze'

export const useCaseWithoutAggregate = <
  Action extends AnyCodec,
  Aggregate extends AnyCodec,
  Result
>(options: {
  action: Action,
  aggregate: Aggregate,
  preCondition?: (opts: { action: Action['O'] }) => boolean,
  execute: (opts: { action: Action['O'] }) => Result
}) => (
  payload: { action: Action['O'] },
): Aggregate['O'] => {
  if(!options.action.is(payload.action)) {
    throw new Error('Invalid Action')
  }

  if(options.preCondition && !options.preCondition(payload)) {
    throw new Error('Invalid Precondition')
  }

  const updatedAggregate = options.execute(payload)

  if(!options.aggregate.is(updatedAggregate)) {
    throw new Error('Aggregate invalid after use case')
  }

  return updatedAggregate
}

type EventDefinition<
  Event extends AnyCodec,
  Action extends AnyCodec,
  Aggregate extends AnyCodec
> = {
  event: Event,
  condition?: (payload: { aggregateBefore: Aggregate, aggregateAfter: Aggregate, action: Action }) => boolean
  mapper: (payload: { aggregateBefore: Aggregate, aggregateAfter: Aggregate, action: Action }) => Event
}



type EventConfig<
  Event extends AnyCodec,
  Aggregate extends AnyCodec,
  Action extends AnyCodec
> = {
  event: Event,
  mapper: ((payload: { aggregateBefore: Aggregate['O'], aggregateAfter: Aggregate['O'], action: Action['O']}) => Event['O'] | undefined),
}


export const useCase = <
  Action extends AnyCodec,
  Aggregate extends AnyCodec,
  Event1 extends AnyCodec,
  Event2 extends AnyCodec,
  Event3 extends AnyCodec,
  Event4 extends AnyCodec,
  Events extends Array<Event1 | Event2 | Event3 | Event4>
>(options: {
  action: Action,
  aggregate: Aggregate,
  events?: [
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
  ],
  preCondition?: (opts: { aggregate: Aggregate['O'], action: Action['O'] }) => boolean,
  execute: (opts: { aggregate: Aggregate['O'], action: Action['O'] }) => Aggregate['O']
}) => (
  payload: {
    action: Action['O'],
    aggregate: Aggregate['O'],
  }
): Aggregate['O'] => {
  if(!options.action.is(payload.action)) {
    throw new Error('Invalid Action')
  }

  if(!options.aggregate.is(payload.aggregate)) {
    throw new Error('Invalid Aggregate')
  }

  if(options.preCondition && !options.preCondition(payload)) {
    throw new Error('Invalid Precondition')
  }

  const updatedAggregate = options.execute(deepFreeze(payload))

  if(!options.aggregate.is(updatedAggregate)) {
    throw new Error('Aggregate invalid after use case')
  }

  const events: Array<Event1 | Event2 | Event3 | Event4> = []
  if (options.events) {
    options.events
      // @ts-ignore
      .forEach((eventConfig) => {
        const mappedEvent = eventConfig.mapper({ aggregateBefore: payload.aggregate, aggregateAfter: updatedAggregate, action: payload.action })
        if (mappedEvent && eventConfig.event.is(mappedEvent)) {
          events.push(mappedEvent)
        }
        return events
      })
  }

  return [updatedAggregate, events]
}

export const domainEventToUseCase = <
  AggregateFromEventCodec extends AnyCodec,
  AggregateFromUseCaseCodec extends AnyCodec,
  AggregateFromEvent extends AggregateFromEventCodec['O'],
  AggregateFromUseCase extends AggregateFromUseCaseCodec['O'],
  DomainEvent extends { aggregate: AggregateFromEventCodec },
  Mapper extends (aggregateFromEvent: DomainEvent['aggregate']['O']) => Action,
  Action,
>(config: {
  event: DomainEvent,
  useCase: (payload: { aggregate: AggregateFromUseCase, action: Action }) => AggregateFromUseCase,
  mapper: Mapper,
}) => (payload: {
  event: { aggregate: AggregateFromEvent },
  aggregate: AggregateFromUseCase
}): AggregateFromUseCase => {
  const action = config.mapper(payload.event.aggregate)
  return config.useCase({ aggregate: payload.aggregate, action })
}