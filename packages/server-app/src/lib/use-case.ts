import { AnyCodec } from '@story-teller/shared'
import deepFreeze from 'deep-freeze'
import { publish, subscribe, createChannel, withChannel } from './queue'
import { withinConnection, DBClient, withinTransaction } from './db'
import { PoolClient } from 'pg'
import { Channel } from 'amqplib'
import { sequentially } from '../utils/sequentially'
import { sendMail, SendMail } from './mailer'
import {
  AggregateInvalid,
  PreConditionViolated,
  PostConditionViolated,
  CommandInvalid,
  AggregateInvalidAfterUseCase,
  AggregateInvalidBeforeUseCase,
  EventInvalid
} from '../errors'

const SYNC_EVENTS: SyncEventSubscriptions = {}

export interface ExternalDependencies {
  pgClient: PoolClient
  channel: Channel
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
    command: any,
    dependencies: ExternalDependencies
  ) => Promise<any>>
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
          const resultFromListener = await listener(event.payload, dependencies)
          const newEvents = resultFromListener?.[1]
            ? resultFromListener[1]
            : []
          eventsToReturn.push(...newEvents as any[])
        })
    // @ts-expect-error
    }).flat()

    await sequentially(eventCallbacks)

    return eventsToReturn
  }

  const execute: ExecutableConnectedUseCase<UseCaseConfig> = async (command, hooks) => {
    return await withinTransaction(async ({ client }) => {
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
      throw new CommandInvalid(decodedCommandResult.get())
    }
    const decodedCommand = decodedCommandResult.get()

    const fromAggregate = await config.fetchAggregate(config.mapCommand(decodedCommand), dependencies)

    if (hooks?.beforeUseCase && !hooks.beforeUseCase({ aggregate: fromAggregate })) {
      throw new PreConditionViolated()
    }

    const [toAggregate, events] = config.useCase.run({ command: decodedCommand, aggregate: fromAggregate })

    if (hooks?.afterUseCase && !hooks.afterUseCase({ aggregate: toAggregate })) {
      throw new PostConditionViolated()
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
    const command = config.command.decode(payload.command)
      .mapError((error) => { throw new CommandInvalid(error) })
      .get()

    const aggregateFrom = config.aggregateFrom.decode(payload.aggregate)
      .mapError((error) => {
        throw new AggregateInvalidBeforeUseCase(error)
      })
      .get()

    if (config.preCondition && !config.preCondition({
      aggregate: aggregateFrom
    })) {
      throw new PreConditionViolated()
    }

    const updatedAggregate = config.execute(deepFreeze(payload))

    config.aggregateTo.decode(updatedAggregate)
      .mapError((error) => {
        throw new AggregateInvalidAfterUseCase(error)
      })

    return [updatedAggregate, collectEvents({
      aggregateFrom: aggregateFrom,
      aggregateTo: updatedAggregate,
      command: command
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
    config.aggregate.decode(aggregate)
      .mapError((error) => { throw new AggregateInvalid(error) })

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
  UseCase extends {
    raw: (payload: Aggregate['O'], clients: ExternalDependencies) => any
  },
  Mapper extends (event: DomainEvent['payload']['O']) =>
  Parameters<UseCase['raw']>[0],
  DomainEvent extends DomainEventConfig<any, AnyCodec>,
>(config: {
  event: DomainEvent
  mapper: Mapper
  useCase: UseCase
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
  UseCase extends {
    execute: (payload: Aggregate['O']) => any
  },
  Mapper extends (event: DomainEvent['payload']['O']) =>
  Parameters<UseCase['execute']>[0],
  DomainEvent extends DomainEventConfig<any, AnyCodec>,
>(config: {
  event: DomainEvent
  mapper: Mapper
  useCase: UseCase
  getSyncEvents?: () => SyncEventSubscriptions
  channel: Channel
}) => {
  await subscribe('default', async (event: any) => {
    if (event.name !== config.event.name) { return }

    const decodedEvent = config.event.payload.decode(event.payload)
      .mapError((error) => { throw new EventInvalid(error) })
      .get()

    await config.useCase.execute(config.mapper(decodedEvent))
  }, await createChannel())
}
