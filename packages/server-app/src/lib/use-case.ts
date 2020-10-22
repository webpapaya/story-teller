import { AnyCodec, v } from '@story-teller/shared'
import deepFreeze from 'deep-freeze'
import { publish, connectionPromise } from './queue'
import { withinConnection, DBClient } from './db'
import { PoolClient } from 'pg'
import { Channel } from 'amqplib'

const SYNC_EVENTS: SyncEventSubscriptions = {}

type ExternalDependencies = { pgClient: PoolClient, channel: Channel }


// ---------- EVENTS
type DomainEventConfig<Name extends Readonly<string>, Payload extends AnyCodec> = {
  name: Name
  payload: Payload
}

type EventConfig<
  Event extends DomainEventConfig<any, AnyCodec>,
  Aggregate extends AnyCodec,
  Command extends AnyCodec
> = {
  event: Event
  mapper: ((payload: { aggregateBefore: Aggregate['O'], aggregateAfter: Aggregate['O'], command: Command['O']}) => Event['payload']['O'] | undefined)
}

type AnyEventConfig = EventConfig<DomainEventConfig<any, AnyCodec>, AnyCodec, AnyCodec>



type Events<UseCaseConfig extends AnyUseCaseConfigType> = [] | [
  EventConfig<UseCaseConfig['events'][0], UseCaseConfig['aggregateTo'], UseCaseConfig['command']>,
] | [
  EventConfig<UseCaseConfig['events'][0], UseCaseConfig['aggregateTo'], UseCaseConfig['command']>,
  EventConfig<UseCaseConfig['events'][1], UseCaseConfig['aggregateTo'], UseCaseConfig['command']>,
] | [
  EventConfig<UseCaseConfig['events'][0], UseCaseConfig['aggregateTo'], UseCaseConfig['command']>,
  EventConfig<UseCaseConfig['events'][1], UseCaseConfig['aggregateTo'], UseCaseConfig['command']>,
  EventConfig<UseCaseConfig['events'][2], UseCaseConfig['aggregateTo'], UseCaseConfig['command']>,
] | [
  EventConfig<UseCaseConfig['events'][0], UseCaseConfig['aggregateTo'], UseCaseConfig['command']>,
  EventConfig<UseCaseConfig['events'][1], UseCaseConfig['aggregateTo'], UseCaseConfig['command']>,
  EventConfig<UseCaseConfig['events'][2], UseCaseConfig['aggregateTo'], UseCaseConfig['command']>,
  EventConfig<UseCaseConfig['events'][3], UseCaseConfig['aggregateTo'], UseCaseConfig['command']>,
] | [
  EventConfig<UseCaseConfig['events'][0], UseCaseConfig['aggregateTo'], UseCaseConfig['command']>,
  EventConfig<UseCaseConfig['events'][1], UseCaseConfig['aggregateTo'], UseCaseConfig['command']>,
  EventConfig<UseCaseConfig['events'][2], UseCaseConfig['aggregateTo'], UseCaseConfig['command']>,
  EventConfig<UseCaseConfig['events'][3], UseCaseConfig['aggregateTo'], UseCaseConfig['command']>,
  EventConfig<UseCaseConfig['events'][4], UseCaseConfig['aggregateTo'], UseCaseConfig['command']>,
]




type UseCaseConfig<
  Command extends AnyCodec,
  AggregateFrom extends AnyCodec,
  AggregateTo extends AnyCodec,
> = {
  command: AnyCodec,
  aggregateFrom: AnyCodec,
  aggregateTo: AnyCodec,
  events: DomainEventConfig<any, AnyCodec>[]
}

type AnyUseCaseConfigType = UseCaseConfig<AnyCodec, AnyCodec, AnyCodec>


type SyncEventSubscriptions = Record<string, {
  eventPayload: AnyCodec,
  listeners: Array<(
    command: unknown,
    dependencies: ExternalDependencies
  ) => Promise<[unknown, unknown[]]>>
}>

type FetchAggregate <UseCaseConfig extends AnyUseCaseConfigType, Args> =
  (args: Args, clients: { pgClient: DBClient }) => Promise<UseCaseConfig['aggregateFrom']['O']>

type MapCommandToFetchAggregate <UseCaseConfig extends AnyUseCaseConfigType, Args> =
  (cmd: UseCaseConfig['command']['O']) => Args

type EnsureAggregate <UseCaseConfig extends AnyUseCaseConfigType> =
  (args: UseCaseConfig['aggregateTo']['O'], clients: { pgClient: DBClient }) => Promise<unknown>

type EventsFromConfig<Config extends AnyUseCaseConfigType> =
  Config['events'][number][]

type RunUseCase<Config extends AnyUseCaseConfigType> = (payload: {
  command: Config['command']['O'],
  aggregate: Config['aggregateFrom']['O']
}) => [Config['aggregateTo']['O'], EventsFromConfig<Config>]

type UseCaseType<UseCaseConfig extends AnyUseCaseConfigType> = {
  config: {
    command: UseCaseConfig['command']
    aggregateFrom: UseCaseConfig['aggregateFrom']
    aggregateTo: UseCaseConfig['aggregateTo']
    events: Events<UseCaseConfig>
    preCondition?: Precondition<UseCaseConfig>
    execute: ExecuteUseCase<UseCaseConfig>
  },
  run: RunUseCase<UseCaseConfig>
}

type RawConnectedUseCase<UseCaseConfig extends AnyUseCaseConfigType> =
  (command: UseCaseConfig['command']['O'], dependencies: ExternalDependencies) => Promise<[UseCaseConfig['aggregateTo']['O'], any[]]>

type ExecutableConnectedUseCase<UseCaseConfig extends AnyUseCaseConfigType> =
  (command: UseCaseConfig['command']['O']) => Promise<[UseCaseConfig['aggregateTo']['O'], any[]]>


type Precondition<UseCaseConfig extends AnyUseCaseConfigType> =
  (opts: { aggregate: UseCaseConfig['aggregateFrom']['O'], command: UseCaseConfig['command']['O'] }) => boolean

type ExecuteUseCase<UseCaseConfig extends AnyUseCaseConfigType> =
  (opts: { aggregate: UseCaseConfig['aggregateTo']['O'], command: UseCaseConfig['command']['O'] }) => UseCaseConfig['aggregateTo']['O']

type AnyConnectedUseCaseConfig<UseCaseConfig extends AnyUseCaseConfigType> = {
  useCase: UseCaseType<UseCaseConfig>,
  execute: ExecutableConnectedUseCase<UseCaseConfig>,
  raw: RawConnectedUseCase<UseCaseConfig>
}




export const connectUseCase = <UseCaseConfig extends AnyUseCaseConfigType, FetchAggregateArgs>(config: {
  useCase: UseCaseType<UseCaseConfig>,
  mapCommand: (cmd: UseCaseConfig['command']['O']) => FetchAggregateArgs,
  fetchAggregate: FetchAggregate<UseCaseConfig, FetchAggregateArgs>
  ensureAggregate: EnsureAggregate<UseCaseConfig>
  getSyncedSubscriptions?: () => SyncEventSubscriptions
}) => {
  const callsRelatedUseCasesSync = async (events: EventsFromConfig<UseCaseConfig>, dependencies: ExternalDependencies) => {
    const syncedSubscriptions = config.getSyncedSubscriptions?.() || {}
    const eventToReturn = [...events]
    for (let event of events) {
      const eventSub = syncedSubscriptions[event.name]

      if (eventSub) {
        for (let listener of (eventSub.listeners as any[])) {
          const [_, newEvents] = await listener.useCase.raw(listener.mapper(event.payload), dependencies)
          eventToReturn.push(...newEvents)
        }
      }
    }
    return eventToReturn
  }

  const execute: ExecutableConnectedUseCase<UseCaseConfig> = async (command) => {
    return withinConnection(async ({ client }) => {
      const queue = await connectionPromise
      const channel = await queue.createChannel()
      const [aggregate, events] = await raw(command, { pgClient: client, channel })
      for (let event of events) {
        await publish('default', event, channel)
      }
      return aggregate
    })
  }

  const raw: RawConnectedUseCase<UseCaseConfig> = async (command, dependencies) => {
    if (!config.useCase.config.command.is(command)) {
      throw new Error('Invalid Command')
    }

    const fromAggregate = await config.fetchAggregate(config.mapCommand(command), dependencies)
    const [toAggregate, events] = config.useCase.run({ command, aggregate: fromAggregate })
    await config.ensureAggregate(toAggregate, dependencies)

    const eventsToReturn = await callsRelatedUseCasesSync(events, dependencies)

    return [toAggregate, eventsToReturn]
  }

  return { useCase: config.useCase, raw, execute }
}








export const useCase = <
  Command extends AnyCodec,
  Aggregate extends AnyCodec,
  Config extends {
    command: Command,
    aggregateFrom: Aggregate,
    aggregateTo: Aggregate,
    events: DomainEventConfig<any, AnyCodec>[]
  }
>(config: {
  command: Command,
  aggregate: Aggregate,
  events: Events<Config>
  preCondition?: Precondition<Config>
  execute: ExecuteUseCase<Config>
}) => {
  return aggregateFactory({
    ...config,
    aggregateFrom: config.aggregate,
    aggregateTo: config.aggregate
  })
}

export const aggregateFactory = <
  Command extends AnyCodec,
  AggregateFrom extends AnyCodec,
  AggregateTo extends AnyCodec,
  Config extends {
    command: Command,
    aggregateFrom: AggregateFrom,
    aggregateTo: AggregateTo,
    events: DomainEventConfig<any, AnyCodec>[]
  }
>(config: {
  command: Command,
  aggregateFrom: AggregateFrom,
  aggregateTo: AggregateTo,
  events: Events<Config>
  preCondition?: Precondition<Config>
  execute: ExecuteUseCase<Config>
}) => {
  const collectEvents = (payload: Pick<Config, 'aggregateFrom' | 'aggregateTo' | 'command'>) => {
    const events: Config['events'][number][] = []
    config.events.forEach((eventConfig) => {
      const mappedEvent = eventConfig.mapper({
        aggregateBefore: payload.aggregateFrom,
        aggregateAfter: payload.aggregateTo,
        command: payload.command
      })

      if (mappedEvent && eventConfig.event.payload.is(mappedEvent)) {
        events.push({ name: eventConfig.event.name, payload: mappedEvent })
      }
    })
    return events
  }

  const run: RunUseCase<Config> = (payload) => {
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

    return [updatedAggregate, collectEvents({
      aggregateFrom: payload.aggregate,
      aggregateTo: updatedAggregate,
      command: payload.command
    })]
  }

  return ({ config, run })
}







































type ConfigDefinition<
  AggregateFromEventCodec extends AnyCodec,
  DomainEvent extends AggregateFromEventCodec,
  AggregateFromUseCaseCodec extends AnyCodec,
  AggregateFromEvent extends AggregateFromEventCodec['O'],
  AggregateFromUseCase extends AggregateFromUseCaseCodec['O'],
  Mapper extends (aggregateFromEvent: DomainEvent['O']) => Command,
  Command
> = {
  event: DomainEvent
  useCase: { run: (payload: { aggregate: AggregateFromUseCase, command: Command }) => [AggregateFromUseCase, unknown] }
  mapper: Mapper
}

export const domainEventToUseCase = <
  AggregateFromEventCodec extends AnyCodec,
  DomainEvent extends AggregateFromEventCodec,
  AggregateFromUseCaseCodec extends AnyCodec,
  AggregateFromEvent extends AggregateFromEventCodec['O'],
  AggregateFromUseCase extends AggregateFromUseCaseCodec['O'],
  Mapper extends (aggregateFromEvent: DomainEvent['O']) => Command,
  Command,
  Config extends ConfigDefinition<
    AggregateFromEventCodec,
    DomainEvent,
    AggregateFromUseCaseCodec,
    AggregateFromEvent,
    AggregateFromUseCase,
    Mapper,
    Command
  >,
  Run extends (payload: {
    event: AggregateFromEvent
    aggregate: AggregateFromUseCase
  }) => [AggregateFromUseCase, unknown]
>(config: Config) => {
  // @ts-ignore
  const run: Run = (payload) => {
    const command = config.mapper(payload.event)
    return config.useCase.run({ aggregate: payload.aggregate, command })
  }
  return ({ config, run })
}




export const reactToEventSync = <
  ConnectedUseCaseConfig extends AnyConnectedUseCaseConfig<AnyUseCaseConfigType>,
  DomainEvent extends DomainEventConfig<any, AnyCodec>,
>(config: {
    event: DomainEvent,
    mapper: (event: DomainEvent['payload']['O']) =>
      ConnectedUseCaseConfig['useCase']['config']['command']['O'],
    useCase: ConnectedUseCaseConfig,
    getSyncEvents?: () => SyncEventSubscriptions
}) => {
  const syncEvent = config.getSyncEvents
    ? config.getSyncEvents()
    : SYNC_EVENTS

  if (!syncEvent[config.event.name]) {
    syncEvent[config.event.name] = {
      eventPayload: config.event.payload,
      listeners: []
    }
  }

  syncEvent[config.event.name].listeners.push(config.useCase.raw)
  return syncEvent;
}