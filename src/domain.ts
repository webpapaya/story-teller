import { Omit, SingleEvent } from './lib/types'
import { ZonedDateTime } from 'js-joda'

export interface User {
  id: number
  name: string
}

type StampTypes =
  | 'Start'
  | 'Break'
  | 'Stop'

export interface Stamp {
  id: number
  type: StampTypes
  timestamp: ZonedDateTime
  location?: string
  note?: string
}

export interface VerifiedTitle {
  id: number
  name: string
  kind: 'verified'
}

export interface UnverifiedTitle {
  id: number
  name: string
  userId: number
  kind: 'unverified'
}

export type Title =
  | VerifiedTitle
  | UnverifiedTitle

export type AllEvents =
  | SingleEvent<'title/created', Pick<UnverifiedTitle, 'id' | 'name' | 'userId'>>
  | SingleEvent<'title/verified', Pick<Title, 'id'>>
  | SingleEvent<'title/notVerified', Pick<Title, 'id'>>

  | SingleEvent<'stamp/created', Omit<Stamp, 'id'>>
  | SingleEvent<'stamp/created', Omit<Stamp, 'id'>>
  | SingleEvent<'user/created', User>
  | SingleEvent<'user/updated', User>
  | SingleEvent<'user/deleted', Pick<User, 'id'>>

export type AllQueries = {
  titles: Title
  users: User
}
