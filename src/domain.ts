import { Omit, SingleEvent } from './lib/types'
import { ZonedDateTime } from 'js-joda'
import uuid from 'uuid'

type ID = ReturnType<typeof uuid>
export interface User {
  id: ID
  name: string
}

type StampTypes =
  | 'Start'
  | 'Break'
  | 'Stop'

export interface Stamp {
  id: ID
  type: StampTypes
  timestamp: ZonedDateTime
  location?: string
  note?: string
}

export interface VerifiedTitle {
  id: ID
  name: string
  kind: 'verified'
}

export interface UnverifiedTitle {
  id: ID
  name: string
  userId: ID
  kind: 'unverified'
}

export type Title =
  | VerifiedTitle
  | UnverifiedTitle

export type AllEvents =
  | SingleEvent<'title/created', Omit<UnverifiedTitle, 'kind'>>
  | SingleEvent<'title/verified', Pick<Title, 'id'>>
  | SingleEvent<'title/notVerified', Pick<Title, 'id'>>

  | SingleEvent<'stamp/created', Stamp>
  | SingleEvent<'stamp/created', Stamp>
  | SingleEvent<'user/created', User>
  | SingleEvent<'user/updated', User>
  | SingleEvent<'user/deleted', Pick<User, 'id'>>

export type AllQueries = {
  titles: Title
  users: User
}
