import { Omit, SingleEvent } from './lib/types'
import { ZonedDateTime, LocalDate, Duration } from 'js-joda'
import uuid from 'uuid'

type ID = ReturnType<typeof uuid>
export interface User {
  id: ID
  name: string
}

export type StampTypes =
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

export type BookingTypes =
 | 'Work'
 | 'Break'

export type Booking = {
  id?: ID
  type: BookingTypes
  from: ZonedDateTime
  until: ZonedDateTime
  correlationDate: LocalDate
  origin: Stamp[]
}

export type Config = {
  correlationDate:
  | { kind: 'combineIntersection' }
  | { kind: 'combineWhenClose', threshold: Duration }
}

type DayOffset =
  | 0
  | 2
  | 4

export type MultiDayAbsence = {
  from: LocalDate
  until: LocalDate
  morningOffset: DayOffset
  eveningOffset: DayOffset
  kind: 'multiday'
}

export type SingleDayMorningAbsence = {
  date: LocalDate
  offset: DayOffset
  kind: 'singleDayMorning'
}

export type SingleDayEveningAbsence = {
  date: LocalDate
  offset: DayOffset
  kind: 'singleDayEvening'
}

export type Absence =
  | SingleDayMorningAbsence
  | SingleDayEveningAbsence
  | MultiDayAbsence

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
