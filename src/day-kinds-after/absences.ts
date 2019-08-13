import { LocalDate } from 'js-joda'
import { DayPart, Absence } from '../domain'
import { Omit } from '../types'

const getDayPartOffset = (absence: Absence, date: LocalDate) => {
  if (absence.kind === 'singleDay' && absence.date.equals(date)) {
    return { offset: absence.offset, duration: absence.duration }
  } else if (absence.kind === 'multiday' && absence.from.equals(date)) {
    return { offset: absence.morningOffset, duration: 1 - absence.morningOffset }
  } else if (absence.kind === 'multiday' && absence.until.equals(date)) {
    return { offset: 0, duration: 1 - absence.eveningOffset }
  } else if (absence.kind === 'multiday' && absence.from.isBefore(date) && absence.until.isAfter(date)) {
    return { offset: 0, duration: 1 }
  }
}
export const convertAbsences = (absence: Absence[], date: LocalDate) => {
  return absence.reduce((result, absence) => {
    const dayPartOffset = getDayPartOffset(absence, date)
    if (dayPartOffset) {
      result.push({
        type: 'absence',
        offset: dayPartOffset.offset,
        duration: dayPartOffset.duration
      })
    }
    return result
  }, [] as Array<Omit<DayPart, 'priority'>>)
}

export const sortAbsences = (absences: Absence[]) => {
  return [...absences].sort((a, b) => {
    const aValidFrom = a.kind === 'multiday'
      ? a.until.toEpochDay()
      : a.date.toEpochDay()

    const bValidFrom = b.kind === 'multiday'
      ? b.until.toEpochDay()
      : b.date.toEpochDay()

    return aValidFrom - bValidFrom
  })
}

export const cleanAbsences = (absences: Absence[], date: LocalDate) => {
  const canBeRemoved = () => {
    const absence = absences[0]
    if (absence && absence.kind === 'multiday') {
      return absence.until.isBefore(date)
    } else if (absence && absence.kind === 'singleDay') {
      return absence.date.isBefore(date)
    }
  }

  while (canBeRemoved()) { absences.shift() }
}
