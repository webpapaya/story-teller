import { WorkTimeModel, PrioritizedDayPart, Absence, PublicHolidayConfig, DayPart } from '../domain'
import { LocalDate } from 'js-joda'
import { combineDayParts } from '../combine-day-parts'
import { sortAbsences, cleanAbsences, convertAbsences } from './absences'
import { sortWorkTimeModels, cleanWorkTimeModels, convertWorkTimeModels } from './work-time-models'
import { sortHolidays, cleanHolidays, convertHolidays } from './holidays'

type Models = {
  workTimeModels: WorkTimeModel[]
  absences: Absence[]
  holidays: PublicHolidayConfig[]
}

type ModelConfig<T> = {
  sort: (values: T) => T
  clean: (values: T, date: LocalDate) => void
  priority: number
  convert: (values: T, date: LocalDate) => Array<DayPart | undefined>
}

type Config = {
  [key in keyof Models]: ModelConfig<Models[key]>
}

const buildDayKindsAfter = (config: Config) => function * (models: Models, from: LocalDate) {
  const modelNames = Object.keys(config) as unknown as Array<keyof Config>
  modelNames.forEach((model) => {
    // @ts-ignore
    models[model] = config[model].sort(models[model])
  })

  for (let i = 0; ; i++) {
    const date = from.plusDays(i)
    const dayParts: PrioritizedDayPart[] = [
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
  },
  holidays: {
    sort: sortHolidays,
    clean: cleanHolidays,
    priority: 3,
    convert: convertHolidays
  }
})
