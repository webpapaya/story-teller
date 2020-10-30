import { DBClient, WithinConnection } from './db'

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type EventId = string

export interface GenericEvent {
  type: string
  payload: unknown
  replacedBy?: number
}

export type SingleEvent<Type, Payload> = GenericEvent & {
  type: Type
  payload: Payload
  replacedBy?: number
}

type UnboundInternalEvent<DomainEvents> = { id: EventId, payload: unknown } & DomainEvents

export interface UnboundReducers<DomainEvents> {
  [table: string]: (event: UnboundInternalEvent<DomainEvents>, client: DBClient) => Promise<void>
}

export interface GenericQueries {
  [table: string]: unknown
}

export type UnboundQueries<T> = {
  [P in keyof T]: (client: DBClient) => Promise<Array<T[P]>>
}

export type ExecutableQueries<T> = {
  [P in keyof T]: () => Promise<Array<T[P]>>
}

export interface Config<DomainEvents, DomainQueries> {
  reducers: UnboundReducers<DomainEvents>
  queries: UnboundQueries<DomainQueries>
  withinConnection: WithinConnection
  tableName?: string
  rebuildSchemaName?: string
}
