import {
  WorkTimeModel,
  Versioned,
  DayPart,
  Absence
} from './domain'
import { LocalDate } from 'js-joda'
import { combineDayParts } from './combine-day-parts'

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
type ModelConfig<T> = {
  sort: (values: T) => T
  clean: (values: T, date: LocalDate) => void
  priority: number
  convert: (values: T, date: LocalDate) => Array<Omit<DayPart, 'priority'> | undefined>
}

type Models = {
  workTimeModels: WorkTimeModel[]
  absences: Absence[]
}

type Config = {
  [key in keyof Models]: ModelConfig<Models[key]>
}

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
const convertAbsences = (absence: Absence[], date: LocalDate) => {
  return absence.reduce((result, absence) => {
    const x = getDayPartOffset(absence, date)
    if (x) {
      result.push({
        type: 'absence',
        offset: x.offset,
        duration: x.duration
      })
    }
    return result
  }, [] as Array<Omit<DayPart, 'priority'>>)
}

const sortWorkTimeModels = <T>(versioned: Array<Versioned<T>>) => {
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

const isAfterOrEqual = (a: LocalDate, b: LocalDate) =>
  a.isAfter(b) || a.equals(b)

const cleanWorkTimeModels = (versioned: Array<Versioned<unknown>>, date: LocalDate) => {
  const canBeRemoved = () => {
    const validFrom = versioned[1] && versioned[1].validFrom
    return validFrom && isAfterOrEqual(date, validFrom)
  }

  while (canBeRemoved()) { versioned.shift() }
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

const convertWorkTimeModels = (workTimeModels: WorkTimeModel[], date: LocalDate) => {
  const weekday = getWeekdayName(date)
  if (!(workTimeModels[0] && workTimeModels[0][weekday])) { return [] }
  return [{ type: 'workday', offset: 0, duration: 1 }]
}

const getWeekdayName = (date: LocalDate) =>
  date.dayOfWeek().name() as keyof Omit<WorkTimeModel, 'validFrom'>

const buildDayKindsAfter = (config: Config) => function * (models: Models, from: LocalDate) {
  const modelNames = Object.keys(config) as unknown as Array<keyof Config>
  modelNames.forEach((model) => {
    // @ts-ignore
    models[model] = config[model].sort(models[model])
  })

  for (let i = 0; ; i++) {
    const date = from.plusDays(i)
    const dayParts: DayPart[] = [
      { type: 'restday', priority: 0, offset: 0, duration: 1 }
    ]

    modelNames.forEach((model) => {
      // @ts-ignore
      config[model].clean(models[model], date)
      // @ts-ignore
      config[model].convert(models[model], date).map((dayPart) => {
        if (dayPart) {
          dayParts.push({ ...dayPart, priority: config[model].priority })
        }
      })
    })

    yield { date, parts: combineDayParts(dayParts) }
  }
}

export const dayKindsAfter = buildDayKindsAfter({
  workTimeModels: {
    sort: sortWorkTimeModels,
    clean: cleanWorkTimeModels,
    priority: 1,
    convert: convertWorkTimeModels
  },
  absences: {
    sort: sortAbsences,
    clean: cleanAbsences,
    priority: 2,
    convert: convertAbsences
  }
})
