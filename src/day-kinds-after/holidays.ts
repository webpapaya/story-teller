import { BoxedVersioned, PublicHolidayConfig, DayPart } from '../domain'
import { LocalDate } from 'js-joda'
import { resolveHoliday } from '../public-holidays'

export const sortHolidays = <T>(versioned: Array<BoxedVersioned<T>>) => {
  return [...versioned].sort((a, b) => {
    const aValidFrom = a.validUntil
      ? a.validUntil.toEpochDay()
      : Number.POSITIVE_INFINITY

    const bValidFrom = b.validUntil
      ? b.validUntil.toEpochDay()
      : Number.POSITIVE_INFINITY

    return aValidFrom - bValidFrom
  })
}

export const cleanHolidays = (versioned: Array<BoxedVersioned<unknown>>, date: LocalDate) => {
  const canBeRemoved = () => {
    const validUntil = versioned[1] && versioned[1].validUntil
    return validUntil && date.isAfter(validUntil)
  }

  while (canBeRemoved()) { versioned.shift() }
}

export const convertHolidays = (holidaysConfig: PublicHolidayConfig[], date: LocalDate) => {
  return holidaysConfig.reduce((result, holidayConfig) => {
    const holiday = resolveHoliday(holidayConfig, date.year())
    if (holiday.date.isEqual(date)) {
      result.push({
        type: 'holiday',
        offset: holiday.offset,
        duration: holiday.duration
      })
    }
    return result
  }, [] as Array<Omit<DayPart, 'priority'>>)
}
