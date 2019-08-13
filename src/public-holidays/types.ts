type FixedDate = {
  name: string
  month: number
  day: number
  kind: 'fixedDate'
}

type Weekday =
| 'MONDAY'
| 'TUESDAY'
| 'WEDNESDAY'
| 'THURSDAY'
| 'FRIDAY'
| 'SATURDAY'
| 'SUNDAY'

type EasterBased = {
  name: string
  easterOffset: number
  kind: 'easterBased'
}

type OrdinalWeekdayInMonth = {
  name: string
  weekday: Weekday
  month: number
  ordinalOffset: number
}

type PublicHoliday =
  | FixedDate
  | EasterBased
  | OrdinalWeekdayInMonth
