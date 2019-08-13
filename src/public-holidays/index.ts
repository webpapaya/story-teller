import { FixedDate, PublicHoliday, CatholicEasterBased, OrthodoxEasterBased } from './types'
import { LocalDate } from 'js-joda'
import { calculateCatholicEasterSunday, calculateOrthodoxEasterSunday } from './calculate-easter-sunday'

type Resolve<Holiday> = (holiday: Holiday, year: number) => PublicHoliday

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
