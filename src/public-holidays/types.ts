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

export type FirstWeekdayInMonth = {
  name: string
  weekday: Weekday
  month: number
  ordinalOffset: number
  kind: 'firstWeekdayInMonth'
}

export type LastWeekdayInMonth = {
  name: string
  weekday: Weekday
  month: number
  ordinalOffset: number
  kind: 'lastWeekdayInMonth'
}

export type WeekdayOnOrBeforeDate = {
  name: string
  weekday: Weekday
  month: number
  day: number
  kind: 'weekdayOnOrBeforeDate'
}

export type WeekdayOnOrAfterDate = {
  name: string
  weekday: Weekday
  month: number
  day: number
  kind: 'weekdayOnOrAfterDate'
}

export type PublicHolidayConfig =
| FixedDate
| CatholicEasterBased
| OrthodoxEasterBased
| FirstWeekdayInMonth
| LastWeekdayInMonth
| WeekdayOnOrBeforeDate
| WeekdayOnOrAfterDate

export type PublicHoliday = {
  date: LocalDate
  name: string
}
