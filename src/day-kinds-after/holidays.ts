import { BoxedVersioned, PublicHolidayConfig, DayPart } from '../domain'
import { LocalDate } from 'js-joda'
import { resolveHoliday } from '../public-holidays'

export const sortHolidays = <T>(versioned: Array<BoxedVersioned<T>>) => {
  return [...versioned].sort((a, b) => {
    const aValidUntil = a.validUntil
      ? a.validUntil.toEpochDay()
      : Number.POSITIVE_INFINITY

    const bValidUntil = b.validUntil
      ? b.validUntil.toEpochDay()
      : Number.POSITIVE_INFINITY

    return aValidUntil - bValidUntil
  })
}

export const cleanHolidays = (versioned: Array<BoxedVersioned<unknown>>, date: LocalDate) => {
  const canBeRemoved = () => {
    const validUntil = versioned[1] && versioned[1].validUntil
    return validUntil && date.isAfter(validUntil)
  }

  while (canBeRemoved()) { versioned.shift() }
}

const isRelevant = (record: BoxedVersioned<unknown>, date: LocalDate) => {
  const isBefore =
      !record.validFrom ||
        record.validFrom.isBefore(date) ||
          record.validFrom.isEqual(date)

  const isAfter =
    !record.validUntil ||
      record.validUntil.isAfter(date) ||
        record.validUntil.isEqual(date)

  return isBefore && isAfter
}

export const convertHolidays = (holidaysConfig: PublicHolidayConfig[], date: LocalDate) => {
  return holidaysConfig
    .filter((holidaysConfig) => isRelevant(holidaysConfig, date))
    .reduce((result, holidayConfig) => {
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
