import { AnyCodec } from '@story-teller/shared'
import deepFreeze from 'deep-freeze'
import { publish, connectionPromise } from './queue'
import { withinConnection, DBClient } from './db'
import { PoolClient } from 'pg'
import { Channel } from 'amqplib'

type DomainEventConfig<Name extends Readonly<string>, Payload extends AnyCodec> = {
  name: Name
  payload: Payload
}

type DomainEvent<Config extends DomainEventConfig<any, any>> = {
  name: Config['name']
  payload: Config['payload']['O']
}

type EventConfig<
  Event extends DomainEventConfig<any, AnyCodec>,
  Aggregate extends AnyCodec,
  Command extends AnyCodec
> = {
  event: Event
  mapper: ((payload: { aggregateBefore: Aggregate['O'], aggregateAfter: Aggregate['O'], command: Command['O']}) => Event['payload']['O'] | undefined)
}

type Events<
  Command extends AnyCodec,
  Aggregate extends AnyCodec,
  Event1 extends DomainEventConfig<any, AnyCodec>,
  Event2 extends DomainEventConfig<any, AnyCodec>,
  Event3 extends DomainEventConfig<any, AnyCodec>,
  Event4 extends DomainEventConfig<any, AnyCodec>,
  Event5 extends DomainEventConfig<any, AnyCodec>,
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

type UseCaseConfig<
  Command extends AnyCodec,
  Aggregate extends AnyCodec,
  Event1 extends DomainEventConfig<any, AnyCodec>,
  Event2 extends DomainEventConfig<any, AnyCodec>,
  Event3 extends DomainEventConfig<any, AnyCodec>,
  Event4 extends DomainEventConfig<any, AnyCodec>,
  Event5 extends DomainEventConfig<any, AnyCodec>,
> = {
  command: Command
  aggregate: Aggregate
  events: Events<Command, Aggregate, Event1, Event2, Event3, Event4, Event5>
  preCondition?: (opts: { aggregate: Aggregate['O'], command: Command['O'] }) => boolean
  execute: (opts: { aggregate: Aggregate['O'], command: Command['O'] }) => Aggregate['O']
}

export const useCase = <
  Command extends AnyCodec,
  Aggregate extends AnyCodec,
  Event1 extends DomainEventConfig<any, AnyCodec>,
  Event2 extends DomainEventConfig<any, AnyCodec>,
  Event3 extends DomainEventConfig<any, AnyCodec>,
  Event4 extends DomainEventConfig<any, AnyCodec>,
  Event5 extends DomainEventConfig<any, AnyCodec>,
>(config: UseCaseConfig<Command, Aggregate, Event1, Event2, Event3, Event4, Event5>) => aggregateFactory({
  ...config,
  aggregateFrom: config.aggregate,
  aggregateTo: config.aggregate
})

export const aggregateFactory = <
  Command extends AnyCodec,
  AggregateFrom extends AnyCodec,
  AggregateTo extends AnyCodec,
  Event1 extends DomainEventConfig<any, AnyCodec>,
  Event2 extends DomainEventConfig<any, AnyCodec>,
  Event3 extends DomainEventConfig<any, AnyCodec>,
  Event4 extends DomainEventConfig<any, AnyCodec>,
  Event5 extends DomainEventConfig<any, AnyCodec>,
>(config: {
  command: Command
  aggregateFrom: AggregateFrom
  aggregateTo: AggregateTo
  events: Events<Command, AggregateTo, Event1, Event2, Event3, Event4, Event5>
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
  ): [AggregateFrom['O'], Array<DomainEvent<typeof config.events[number]['event']>>] => {
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

    const events: Array<DomainEvent<Event1> | DomainEvent<Event2> | DomainEvent<Event3> | DomainEvent<Event4> | DomainEvent<Event5>> = []
    if (config.events) {
      config.events
      // @ts-ignore
        .forEach((eventConfig) => {
          const mappedEvent = eventConfig.mapper({
            aggregateBefore: payload.aggregate,
            aggregateAfter: updatedAggregate,
            command: payload.command
          })
          if (mappedEvent && eventConfig.event.payload.is(mappedEvent)) {
            events.push({ name: eventConfig.event.name, payload: mappedEvent })
          }
          return events
        })
    }

    return [updatedAggregate, events]
  }
})

export const domainEventToUseCase = <
  AggregateFromEventCodec extends AnyCodec,
  DomainEvent extends AggregateFromEventCodec,

  AggregateFromUseCaseCodec extends AnyCodec,
  AggregateFromEvent extends AggregateFromEventCodec['O'],
  AggregateFromUseCase extends AggregateFromUseCaseCodec['O'],
  Mapper extends (aggregateFromEvent: DomainEvent['O']) => Command,
  Command,
>(config: {
  event: DomainEvent
  useCase: { run: (payload: { aggregate: AggregateFromUseCase, command: Command }) => [AggregateFromUseCase, unknown] }
  mapper: Mapper
}) => ({
  config,
  run: (payload: {
    event: AggregateFromEvent
    aggregate: AggregateFromUseCase
  }) => {
    const command = config.mapper(payload.event)
    return config.useCase.run({ aggregate: payload.aggregate, command })
  }
})

export const connectUseCase = <
  UseCaseConfig extends { command: AnyCodec, aggregateFrom: AnyCodec, aggregateTo: AnyCodec },
  Command extends UseCaseConfig['command'],
  AggregateFrom extends UseCaseConfig['aggregateFrom'],
  AggregateTo extends UseCaseConfig['aggregateTo'],
  FetchAggregateArgs,
>(config: {
  useCase: {
    config: UseCaseConfig
    run: (payload: { command: Command['O'], aggregate: AggregateFrom['O'] }) => [AggregateTo['O'], any]
  }
  mapCommand: (cmd: Command['O']) => FetchAggregateArgs
  fetchAggregate: (args: FetchAggregateArgs, clients: { pgClient: DBClient }) => Promise<AggregateFrom['O']>
  ensureAggregate: (args: AggregateTo['O'], clients: { pgClient: DBClient }) => Promise<unknown>
}) => {
  const raw = async (command: Command['O'], dependencies: { pgClient: PoolClient, channel: Channel }) => {
    if (!config.useCase.config.command.is(command)) {
      throw new Error('Invalid Command')
    }
    const { pgClient, channel } = dependencies
    const fromAggregate = await config.fetchAggregate(config.mapCommand(command), { pgClient })
    const [toAggregate, events] = config.useCase.run({ command, aggregate: fromAggregate })
    await config.ensureAggregate(toAggregate, { pgClient })
    for (let event of events) {
      await publish('default', event, channel)
    }
    return toAggregate
  }

  return ({
    config,
    raw,
    execute: async (command: Command['O']) => {
      return withinConnection(async ({ client }) => {
        const queue = await connectionPromise
        const channel = await queue.createChannel()
        return raw(command, { pgClient: client, channel })
      })
    }
  })
}
