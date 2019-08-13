import { LocalDate } from 'js-joda'
type BoxedVersioned<Record> = {
  validFrom: LocalDate | null
  validUntil: LocalDate | null
} & Record

export type FixedDate = {
  name: string
  month: number
  day: number
  kind: 'fixedDate'
}

export type Weekday =
| 'MONDAY'
| 'TUESDAY'
| 'WEDNESDAY'
| 'THURSDAY'
| 'FRIDAY'
| 'SATURDAY'
| 'SUNDAY'

export type CatholicEasterBased = {
  name: string
  easterOffset: number
  kind: 'catholicEasterBased'
}

export type OrthodoxEasterBased = {
  name: string
  easterOffset: number
  kind: 'orthodoxEasterBased'
}

export type OrdinalWeekdayInMonth = {
  name: string
  weekday: Weekday
  month: number
  ordinalOffset: number
  kind: 'ordinalWeekdayInMonth'
}

export type WeekdayOnOrBeforeDate = {
  name: string
  weekday: Weekday
  month: number
  day: number
  kind: 'weekdayOnOrBeforeDate'
}

export type PublicHolidayConfig = BoxedVersioned<
| FixedDate
| CatholicEasterBased
| OrthodoxEasterBased
| OrdinalWeekdayInMonth
| WeekdayOnOrBeforeDate
>

export type PublicHoliday = {
  date: LocalDate
  name: string
}
