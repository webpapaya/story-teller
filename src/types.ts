import { DBClient } from './db';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type EventId = string;
export type SingleEvent<Type, Payload> = {
  type: Type,
  payload: Payload,
  replacedBy?: number
}
export type UnboundInternalEvent<AllEvents> = { id: EventId } & AllEvents;
export type UnboundReducers<AllEvents> = {
  [table: string]: (event:UnboundInternalEvent<AllEvents>, client:DBClient) => Promise<void>
}