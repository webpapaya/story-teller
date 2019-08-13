import { Omit, SingleEvent } from './lib/types'
import { ZonedDateTime, LocalDate, Duration, LocalTime } from 'js-joda'
import uuid from 'uuid'

type ID = ReturnType<typeof uuid>
export interface User {
  id: ID
  name: string
}

export type DayPart = {
  priority: number
  offset: number
  duration: number
  type: string
}

export type DayPartOnDate = {
  date: LocalDate
  parts: DayPart[]
}

export type Versioned<T> = {
  validFrom: LocalDate | null
} & T

export type WorkTimeModel = Versioned<{
  MONDAY: Duration | null
  TUESDAY: Duration | null
  WEDNESDAY: Duration | null
  THURSDAY: Duration | null
  FRIDAY: Duration | null
  SATURDAY: Duration | null
  SUNDAY: Duration | null
}>

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

export type CorrelationDateConfig = {
  startOfDay: LocalTime
  threshold: Duration
  position:
  | 'start'
  | 'center'
  | 'end'
}

export type Config = {
  correlationDate: CorrelationDateConfig
}

export type MultiDayAbsence = {
  from: LocalDate
  until: LocalDate
  morningOffset: number
  eveningOffset: number
  kind: 'multiday'
}

export type SingleDayAbsence = {
  date: LocalDate
  duration: number
  offset: number
  kind: 'singleDay'
}

export type Absence =
  | SingleDayAbsence
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

export type Weekday =
| 'MONDAY'
| 'TUESDAY'
| 'WEDNESDAY'
| 'THURSDAY'
| 'FRIDAY'
| 'SATURDAY'
| 'SUNDAY'

type BoxedVersioned<Record> = {
  validFrom: LocalDate | null
  validUntil: LocalDate | null
} & Record

type DayPartProps<Record> = {
  offset: number
  duration: number
} & Record

type PublicHolidayMeta<T> = BoxedVersioned<DayPartProps<T>>

export type FixedDate = PublicHolidayMeta<{
  name: string
  month: number
  day: number
  kind: 'fixedDate'
}>

export type CatholicEasterBased = PublicHolidayMeta<{
  name: string
  easterOffset: number
  kind: 'catholicEasterBased'
}>

export type OrthodoxEasterBased = PublicHolidayMeta<{
  name: string
  easterOffset: number
  kind: 'orthodoxEasterBased'
}>

export type FirstWeekdayInMonth = PublicHolidayMeta<{
  name: string
  weekday: Weekday
  month: number
  ordinalOffset: number
  kind: 'firstWeekdayInMonth'
}>

export type LastWeekdayInMonth = PublicHolidayMeta<{
  name: string
  weekday: Weekday
  month: number
  ordinalOffset: number
  kind: 'lastWeekdayInMonth'
}>

export type WeekdayOnOrBeforeDate = PublicHolidayMeta<{
  name: string
  weekday: Weekday
  month: number
  day: number
  kind: 'weekdayOnOrBeforeDate'
}>

export type WeekdayOnOrAfterDate = PublicHolidayMeta<{
  name: string
  weekday: Weekday
  month: number
  day: number
  kind: 'weekdayOnOrAfterDate'
}>

export type PublicHolidayConfig =
| FixedDate
| CatholicEasterBased
| OrthodoxEasterBased
| FirstWeekdayInMonth
| LastWeekdayInMonth
| WeekdayOnOrBeforeDate
| WeekdayOnOrAfterDate

export type PublicHoliday = DayPartProps<{
  date: LocalDate
  name: string
}>
