import { FixedDate, PublicHoliday, CatholicEasterBased, OrthodoxEasterBased, FirstWeekdayInMonth, LastWeekdayInMonth } from './types'
import { LocalDate } from 'js-joda'
import {
  calculateCatholicEasterSunday,
  calculateOrthodoxEasterSunday
} from './calculate-easter-sunday'

type Resolve<Holiday> = (holiday: Holiday, year: number) => PublicHoliday

const DAYS_OF_WEEK = 7

export const resolveFixedDate: Resolve<FixedDate> = (holiday, year) => {
  return {
    name: holiday.name,
    date: LocalDate.of(year, holiday.month, holiday.day)
  }
}

export const resolveCatholicEaster: Resolve<CatholicEasterBased> = (holiday, year) => {
  const easterSunday = calculateCatholicEasterSunday(year)
  return {
    name: holiday.name,
    date: easterSunday.plusDays(holiday.easterOffset)
  }
}

export const resolveOrthodoxEaster: Resolve<OrthodoxEasterBased> = (holiday, year) => {
  const easterSunday = calculateOrthodoxEasterSunday(year)
  return {
    name: holiday.name,
    date: easterSunday.plusDays(holiday.easterOffset)
  }
}

export const resolveFirstWeekdayInMonth: Resolve<FirstWeekdayInMonth> = (holiday, year) => {
  let date = LocalDate.of(year, holiday.month, 1)

  for (let i = 0; i < DAYS_OF_WEEK; i++) {
    if (date.dayOfWeek().name() === holiday.weekday) { break }
    date = date.plusDays(1)
  }

  return {
    date: date.plusDays(DAYS_OF_WEEK * holiday.ordinalOffset),
    name: holiday.name
  }
}

export const resolveLastWeekdayInMonth: Resolve<LastWeekdayInMonth> = (holiday, year) => {
  let date = LocalDate
    .of(year, holiday.month, 1)
    .plusMonths(1)
    .minusDays(1)

  for (let i = 0; i < DAYS_OF_WEEK; i++) {
    if (date.dayOfWeek().name() === holiday.weekday) { break }
    date = date.minusDays(1)
  }

  return {
    date: date.minusDays(DAYS_OF_WEEK * holiday.ordinalOffset),
    name: holiday.name
  }
}
