import { Omit, SingleEvent, UnboundReducers } from './lib/types';
import { ZonedDateTime } from 'js-joda';

export type User = {
  id: number,
  name: string
}

type StampTypes =
  | 'Start'
  | 'Break'
  | 'Stop'

export type Stamp = {
  id: number
  type: StampTypes
  timestamp: ZonedDateTime,
  location?: string
  note?: string
}

export type AllEvents =
  | SingleEvent<'stamp/created', Omit<Stamp, 'id'>>
  | SingleEvent<'user/created', User>
  | SingleEvent<'user/updated', User>
  | SingleEvent<'user/deleted', Pick<User, 'id'>>
