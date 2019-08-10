import {
  WorkTimeModel,
  Versioned,
  DayPart,
  Absence
} from './domain'
import { LocalDate } from 'js-joda'
import { combineDayParts } from './combine-day-parts'

const absenceToDayPart = (absence: Absence, date: LocalDate) => {
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

const sortVersioned = <T>(versioned: Array<Versioned<T>>) => {
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

const sortAbsences = (absences: Absence[]) => {
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

type Config = {
  workTimeModels?: WorkTimeModel[]
  absences?: Absence[]
}

const isAfterOrEqual = (a: LocalDate | null, b: LocalDate | null) =>
  a && b && (a.isAfter(b) || a.equals(b))

const cleanVersioned = (versioned: Array<Versioned<unknown>>, date: LocalDate) => {
  while (versioned[1] && isAfterOrEqual(date, versioned[1].validFrom)) {
    versioned.shift()
  }
}

const cleanAbsences = (absences: Absence[], date: LocalDate) => {
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

const getWeekdayName = (date: LocalDate) =>
  date.dayOfWeek().name() as keyof Omit<WorkTimeModel, 'validFrom'>

export function * dayKindsAfter (config: Config, from: LocalDate) {
  const workTimeModels = sortVersioned(config.workTimeModels || [])
  const absences = sortAbsences(config.absences || [])

  for (let i = 0; ; i++) {
    const date = from.plusDays(i)
    cleanVersioned(workTimeModels, date)
    cleanAbsences(absences, date)

    const weekday = getWeekdayName(date)
    const dayParts: DayPart[] = [
      { type: 'restday', priority: 0, offset: 0, duration: 1 }
    ]

    if (workTimeModels[0] && workTimeModels[0][weekday]) {
      dayParts.push({ type: 'workday', priority: 1, offset: 0, duration: 1 })
    }

    absences.forEach((absence) => {
      const t = absenceToDayPart(absence, date)
      if (!t) { return }
      dayParts.push({
        type: 'absence',
        priority: 2,
        offset: t.offset,
        duration: t.duration
      })
    })

    yield { date, parts: combineDayParts(dayParts) }
  }
}
