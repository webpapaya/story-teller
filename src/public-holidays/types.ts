import { LocalDate } from 'js-joda'

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

type DayPart<Record> = {
  offset: number
  duration: number
} & Record

type PublicHolidayMeta<T> = BoxedVersioned<DayPart<T>>

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

export type PublicHoliday = DayPart<{
  date: LocalDate
  name: string
}>
