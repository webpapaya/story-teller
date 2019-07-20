import { Omit, SingleEvent, UnboundReducers } from './lib/types';
import { ZonedDateTime } from 'js-joda';
import { DBClient } from './lib/db';

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

export type VerifiedTitle = {
  id: number,
  name: string,
  kind: 'verified'
}

export type UnverifiedTitle = {
  id: number,
  name: string,
  userId: number,
  kind: 'unverified'
}

export type Title =
  | VerifiedTitle
  | UnverifiedTitle

export type AllEvents =
  | SingleEvent<'title/created', Pick<UnverifiedTitle, 'name' | 'userId'>>
  | SingleEvent<'title/verified', Pick<Title, 'id'>>
  | SingleEvent<'title/notVerified', Pick<Title, 'id'>>

  | SingleEvent<'stamp/created', Omit<Stamp, 'id'>>
  | SingleEvent<'stamp/created', Omit<Stamp, 'id'>>
  | SingleEvent<'user/created', User>
  | SingleEvent<'user/updated', User>
  | SingleEvent<'user/deleted', Pick<User, 'id'>>

export type AllQueries = {
  titles: (client:DBClient) => Promise<Title[]>
}
