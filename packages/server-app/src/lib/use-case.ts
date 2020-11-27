import { AnyCodec } from '@story-teller/shared'
import deepFreeze from 'deep-freeze'
import { publish, subscribe, createChannel, withChannel } from './queue'
import { withinConnection, DBClient } from './db'
import { PoolClient } from 'pg'
import { Channel } from 'amqplib'
import { sequentially } from '../utils/sequentially'
import { sendMail, SendMail } from './mailer'

const SYNC_EVENTS: SyncEventSubscriptions = {}

export interface ExternalDependencies {
  pgClient: PoolClient,
  channel: Channel,
  sendMail: SendMail
}

interface DomainEventConfig<Name extends Readonly<string>, Payload extends AnyCodec> {
  name: Name
  payload: Payload
}

interface EventConfig<
  Event extends DomainEventConfig<any, AnyCodec>,
  Aggregate extends AnyCodec,
  Command extends AnyCodec
> {
  event: Event
  mapper: ((payload: { aggregateBefore: Aggregate['O'], aggregateAfter: Aggregate['O'], command: Command['O']}) => Event['payload']['O'] | undefined)
}

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

interface UseCaseConfig<
  Command extends AnyCodec,
  AggregateFrom extends AnyCodec,
  AggregateTo extends AnyCodec,
> {
  command: Command
  aggregateFrom: AggregateFrom
  aggregateTo: AggregateTo
  events: Array<DomainEventConfig<any, AnyCodec>>
}

export type AnyUseCaseConfigType = UseCaseConfig<AnyCodec, AnyCodec, AnyCodec>

type SyncEventSubscriptions = Record<string, {
  eventPayload: AnyCodec
  listeners: Array<(
    command: unknown,
    dependencies: ExternalDependencies
  ) => Promise<[unknown, unknown[]]>>
}>

type FetchAggregate <UseCaseConfig extends AnyUseCaseConfigType, Args> =
  (args: Args, clients: { pgClient: DBClient }) => Promise<UseCaseConfig['aggregateFrom']['O']>

type EnsureAggregate <UseCaseConfig extends AnyUseCaseConfigType> =
  (args: UseCaseConfig['aggregateTo']['O'], clients: { pgClient: DBClient }) => Promise<unknown>

type EventsFromConfig<Config extends AnyUseCaseConfigType> =
  Array<Config['events'][number]>

type RunUseCase<Config extends AnyUseCaseConfigType> = (payload: {
  command: Config['command']['O']
  aggregate: Config['aggregateFrom']['O']
}) => [Config['aggregateTo']['O'], EventsFromConfig<Config>]

interface UseCaseType<UseCaseConfig extends AnyUseCaseConfigType> {
  config: {
    command: UseCaseConfig['command']
    aggregateFrom: UseCaseConfig['aggregateFrom']
    aggregateTo: UseCaseConfig['aggregateTo']
    events: Events<UseCaseConfig>
    preCondition?: Precondition<UseCaseConfig>
    execute: ExecuteUseCase<UseCaseConfig>
  }
  run: RunUseCase<UseCaseConfig>
}

export type BeforeUseCase<UseCaseConfig extends AnyUseCaseConfigType> = (payload: {
  aggregate: UseCaseConfig['command']['O']
}) => boolean

type RawConnectedUseCase<UseCaseConfig extends AnyUseCaseConfigType> = (
  command: UseCaseConfig['command']['O'],
  dependencies: ExternalDependencies,
  hooks?: {
    beforeUseCase?: BeforeUseCase<UseCaseConfig>
    afterUseCase?: BeforeUseCase<UseCaseConfig>
  }
) => Promise<[UseCaseConfig['aggregateTo']['O'], any[]]>

type ExecutableConnectedUseCase<UseCaseConfig extends AnyUseCaseConfigType> = (
  command: UseCaseConfig['command']['O'],
  hooks?: {
    beforeUseCase?: BeforeUseCase<UseCaseConfig>
    afterUseCase?: BeforeUseCase<UseCaseConfig>
  }
) => Promise<UseCaseConfig['aggregateTo']['O']>

type Precondition<UseCaseConfig extends AnyUseCaseConfigType> =
  (opts: { aggregate: UseCaseConfig['aggregateFrom']['O'] }) => boolean

type ExecuteUseCase<UseCaseConfig extends AnyUseCaseConfigType> =
  (opts: { aggregate: UseCaseConfig['aggregateFrom']['O'], command: UseCaseConfig['command']['O'] }) => UseCaseConfig['aggregateTo']['O']

export interface AnyConnectedUseCaseConfig<UseCaseConfig extends AnyUseCaseConfigType> {
  useCase: UseCaseType<UseCaseConfig>
  execute: ExecutableConnectedUseCase<UseCaseConfig>
  raw: RawConnectedUseCase<UseCaseConfig>
}

export const connectUseCase = <UseCaseConfig extends AnyUseCaseConfigType, FetchAggregateArgs>(config: {
  useCase: UseCaseType<UseCaseConfig>
  mapCommand: (cmd: UseCaseConfig['command']['O']) => FetchAggregateArgs
  fetchAggregate: FetchAggregate<UseCaseConfig, FetchAggregateArgs>
  ensureAggregate: EnsureAggregate<UseCaseConfig>
  getSyncedSubscriptions?: () => SyncEventSubscriptions
}) => {
  const callsRelatedUseCasesSync = async (events: EventsFromConfig<UseCaseConfig>, dependencies: ExternalDependencies) => {
    const syncedSubscriptions = config.getSyncedSubscriptions?.() ?? SYNC_EVENTS
    const eventsToReturn = [...events]

    const eventCallbacks = events.map((event) => {
      const eventSub = syncedSubscriptions[event.name] ?? { listeners: [] }
      return eventSub.listeners
        .map((listener) => async () => {
          const [result, newEvents] = await listener(event.payload, dependencies)
          eventsToReturn.push(...newEvents as any[])
          return result
        })
    // @ts-expect-error
    }).flat()

    await sequentially(eventCallbacks)

    return eventsToReturn
  }

  const execute: ExecutableConnectedUseCase<UseCaseConfig> = async (command, hooks) => {
    // TODO: change to withinTransaction
    return await withinConnection(async ({ client }) => {
      return await withChannel(async ({ channel }) => {
        const [aggregate, events] = await raw(command, {
          pgClient: client,
          channel,
          sendMail
        }, hooks)

        await sequentially(events.map((event) => () => publish('default', event, channel)))

        return aggregate
      })
    })
  }

  const raw: RawConnectedUseCase<UseCaseConfig> = async (command, dependencies, hooks) => {
    const decodedCommandResult = config.useCase.config.command.decode(command)
    if (!decodedCommandResult.isOk()) {
      throw new Error('Invalid Command')
    }
    const decodedCommand = decodedCommandResult.get()

    const fromAggregate = await config.fetchAggregate(config.mapCommand(decodedCommand), dependencies)

    if (hooks?.beforeUseCase && !hooks.beforeUseCase({ aggregate: fromAggregate })) {
      throw new Error('Before usecase throwed error')
    }

    const [toAggregate, events] = config.useCase.run({ command: decodedCommand, aggregate: fromAggregate })

    if (hooks?.afterUseCase && !hooks.afterUseCase({ aggregate: toAggregate })) {
      throw new Error('After usecase throwed error')
    }

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
    command: Command
    aggregateFrom: Aggregate
    aggregateTo: Aggregate
    events: Array<DomainEventConfig<any, AnyCodec>>
  }
>(config: {
  command: Command
  aggregate: Aggregate
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
    command: Command
    aggregateFrom: AggregateFrom
    aggregateTo: AggregateTo
    events: Array<DomainEventConfig<any, AnyCodec>>
  }
>(config: {
  command: Command
  aggregateFrom: AggregateFrom
  aggregateTo: AggregateTo
  events: Events<Config>
  preCondition?: Precondition<Config>
  execute: ExecuteUseCase<Config>
}) => {
  const collectEvents = (payload: Pick<Config, 'aggregateFrom' | 'aggregateTo' | 'command'>) => {
    const events: Array<Config['events'][number]> = []
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

    if (config.preCondition && !config.preCondition({ aggregate: payload.aggregate })) {
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

export const sideEffect = <
  Aggregate extends AnyCodec,
>(config: {
  aggregate: Aggregate
  preCondition?: (payload: { aggregate: Aggregate }) => boolean
  sideEffect: (aggregate: Aggregate['O'], clients: ExternalDependencies) => Promise<void>
}) => {
  const raw = async (aggregate: Aggregate, clients: ExternalDependencies) => {
    if (config.aggregate.is(aggregate)) {
      throw new Error('Invalid aggregate')
    }
    await config.sideEffect(aggregate, clients)
  }
  const execute = async (aggregate: Aggregate) => {
    return await withinConnection(async ({ client }) => {
      return await withChannel(async ({ channel }) => {
        await raw(aggregate, { channel, pgClient: client, sendMail })
      })
    })
  }

  return ({
    raw: config.sideEffect,
    execute
  })
}



export const reactToEventSync = <
  Aggregate extends AnyCodec,
  DomainEvent extends DomainEventConfig<any, AnyCodec>,
>(config: {
  event: DomainEvent
  mapper: (event: DomainEvent['payload']['O']) => Aggregate['O']
  useCase: {
    raw: (payload: Aggregate['O'], clients: ExternalDependencies) => any
  },
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

  const execute = (event: DomainEvent['payload']['O'], dependencies: ExternalDependencies) =>
    config.useCase.raw(config.mapper(event), dependencies)

  syncEvent[config.event.name].listeners.push(execute)

  return { execute }
}

export const reactToEventAsync = async <
  Aggregate extends AnyCodec,
  DomainEvent extends DomainEventConfig<any, AnyCodec>,
>(config: {
  event: DomainEvent
  mapper: (event: DomainEvent['payload']['O']) => Aggregate
  useCase: {
    execute: (payload: Aggregate) => unknown
  },
  getSyncEvents?: () => SyncEventSubscriptions
  channel: Channel
}) => {
  await subscribe('default', async (event: any) => {
    if (event.name !== config.event.name) { return }
    if (!config.event.payload.is(event.payload)) {
      // TODO: introduce error classes
      throw new Error('Could not deserialize event')
    }
    await config.useCase.execute(config.mapper(event))
  }, await createChannel())
}
