import { WorkTimeModel, Versioned } from '../domain'
import { LocalDate } from 'js-joda'
import { Omit } from '../types'

const isAfterOrEqual = (a: LocalDate, b: LocalDate) =>
  a.isAfter(b) || a.equals(b)

const getWeekdayName = (date: LocalDate) =>
  date.dayOfWeek().name() as keyof Omit<WorkTimeModel, 'validFrom'>

export const sortWorkTimeModels = <T>(versioned: Array<Versioned<T>>) => {
  return [...versioned].sort((a, b) => {
    const aValidFrom = a.validFrom
      ? a.validFrom.toEpochDay()
      : Number.NEGATIVE_INFINITY

    const bValidFrom = b.validFrom
      ? b.validFrom.toEpochDay()
      : Number.NEGATIVE_INFINITY

    return aValidFrom - bValidFrom
  })
}

export const cleanWorkTimeModels = (versioned: Array<Versioned<unknown>>, date: LocalDate) => {
  const canBeRemoved = () => {
    const validFrom = versioned[1] && versioned[1].validFrom
    return validFrom && isAfterOrEqual(date, validFrom)
  }

  while (canBeRemoved()) { versioned.shift() }
}

export const convertWorkTimeModels = (workTimeModels: WorkTimeModel[], date: LocalDate) => {
  const weekday = getWeekdayName(date)
  if (!(workTimeModels[0] && workTimeModels[0][weekday])) { return [] }
  return [{ type: 'workday', offset: 0, duration: 1 }]
}
