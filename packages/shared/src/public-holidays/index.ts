import {
  FixedDate,
  CatholicEasterBased,
  OrthodoxEasterBased,
  FirstWeekdayInMonth,
  LastWeekdayInMonth,
  WeekdayOnOrBeforeDate,
  WeekdayOnOrAfterDate,
  PublicHolidayConfig,
  PublicHoliday
} from '../domain'
import { LocalDate } from 'js-joda'
import {
  calculateCatholicEasterSunday,
  calculateOrthodoxEasterSunday,
  firstWeekdayOnOrAfter,
  firstWeekdayOnOrBefore
} from './calendar-utils'

type Resolve<Holiday> = (holiday: Holiday, year: number) => PublicHoliday

const DAYS_OF_WEEK = 7
const resolveFixedDate: Resolve<FixedDate> = (holiday, year) => {
  return {
    name: holiday.name,
    date: LocalDate.of(year, holiday.month, holiday.day),
    offset: holiday.offset,
    duration: holiday.duration
  }
}

const resolveCatholicEaster: Resolve<CatholicEasterBased> = (holiday, year) => {
  const easterSunday = calculateCatholicEasterSunday(year)

  return {
    name: holiday.name,
    date: easterSunday.plusDays(holiday.easterOffset),
    offset: holiday.offset,
    duration: holiday.duration
  }
}

const resolveOrthodoxEaster: Resolve<OrthodoxEasterBased> = (holiday, year) => {
  const easterSunday = calculateOrthodoxEasterSunday(year)

  return {
    name: holiday.name,
    date: easterSunday.plusDays(holiday.easterOffset),
    offset: holiday.offset,
    duration: holiday.duration
  }
}

const resolveFirstWeekdayInMonth: Resolve<FirstWeekdayInMonth> = (holiday, year) => {
  const firstOfMonth = LocalDate.of(year, holiday.month, 1)
  const date = firstWeekdayOnOrAfter(firstOfMonth, holiday.weekday)
    .plusDays(DAYS_OF_WEEK * holiday.ordinalOffset)

  return {
    date,
    name: holiday.name,
    offset: holiday.offset,
    duration: holiday.duration
  }
}

const resolveLastWeekdayInMonth: Resolve<LastWeekdayInMonth> = (holiday, year) => {
  const lastOfMonth = LocalDate
    .of(year, holiday.month, 1)
    .plusMonths(1)
    .minusDays(1)

  const date = firstWeekdayOnOrBefore(lastOfMonth, holiday.weekday)
    .minusDays(DAYS_OF_WEEK * holiday.ordinalOffset)

  return {
    date,
    name: holiday.name,
    offset: holiday.offset,
    duration: holiday.duration
  }
}

const resolveWeekdayOnOrBeforeDate: Resolve<WeekdayOnOrBeforeDate> = (holiday, year) => {
  const initialDate = LocalDate.of(year, holiday.month, holiday.day)
  const date = firstWeekdayOnOrBefore(initialDate, holiday.weekday)

  return {
    date,
    name: holiday.name,
    offset: holiday.offset,
    duration: holiday.duration
  }
}

const resolveWeekdayOnOrAfterDate: Resolve<WeekdayOnOrAfterDate> = (holiday, year) => {
  const initialDate = LocalDate.of(year, holiday.month, holiday.day)
  const date = firstWeekdayOnOrAfter(initialDate, holiday.weekday)

  return {
    date,
    name: holiday.name,
    offset: holiday.offset,
    duration: holiday.duration
  }
}

export const resolveHoliday = (holiday: PublicHolidayConfig, year: number) => {
  switch (holiday.kind) {
    case 'fixedDate':
      return resolveFixedDate(holiday, year)
    case 'weekdayOnOrBeforeDate':
      return resolveWeekdayOnOrBeforeDate(holiday, year)
    case 'weekdayOnOrAfterDate':
      return resolveWeekdayOnOrAfterDate(holiday, year)
    case 'orthodoxEasterBased':
      return resolveOrthodoxEaster(holiday, year)
    case 'catholicEasterBased':
      return resolveCatholicEaster(holiday, year)
    case 'firstWeekdayInMonth':
      return resolveFirstWeekdayInMonth(holiday, year)
    case 'lastWeekdayInMonth':
      return resolveLastWeekdayInMonth(holiday, year)
  }
}
