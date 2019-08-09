// @ts-ignore
import { assertThat, hasProperties, contains } from 'hamjest'
import * as Factory from 'factory.ts'
import { WorkTimeModel, Versioned, DayPart } from './domain'
import { LocalDate, Duration } from 'js-joda'
import { combineDayParts } from './combine-day-parts'

const workTimeModelFactory = Factory.Sync.makeFactory<WorkTimeModel>({
  MONDAY: null,
  TUESDAY: null,
  WEDNESDAY: null,
  THURSDAY: null,
  FRIDAY: null,
  SATURDAY: null,
  SUNDAY: null,
  validFrom: null
})

type Config = { workTimeModels: WorkTimeModel[] }

const isAfterOrEqual = (a: LocalDate, b: LocalDate) =>
  a.isAfter(b) || a.equals(b)

const cleanVersioned = (versioned: Array<Versioned<unknown>>, date: LocalDate) => {
  while (versioned[1] && versioned[1].validFrom && isAfterOrEqual(date, versioned[1].validFrom)) {
    versioned.shift()
  }
}

const getWeekdayName = (date: LocalDate) =>
  date.dayOfWeek().name() as keyof Omit<WorkTimeModel, 'validFrom'>

function * dayTypesAfter (config: Config, from: LocalDate) {
  const workTimeModels = [...config.workTimeModels]

  for (let i = 0; ; i++) {
    const date = from.plusDays(i)
    cleanVersioned(workTimeModels, date)

    const weekday = getWeekdayName(date)
    const dayParts: DayPart[] = [
      { type: 'restday', priority: 0, offset: 0, duration: 0 }
    ]

    if (workTimeModels[0] && workTimeModels[0][weekday]) {
      dayParts.push({ type: 'workday', priority: 1, offset: 0, duration: 1 })
    }

    yield { date, parts: combineDayParts(dayParts) }
  }
}

describe('dayTypeOnDate', () => {
  const workTimeModels = [
    workTimeModelFactory.build({
      SATURDAY: null,
      validFrom: LocalDate.parse('2000-01-01')
    }),
    workTimeModelFactory.build({
      SUNDAY: Duration.ofHours(8),
      validFrom: LocalDate.parse('2000-01-02')
    })
  ]

  it('when no work time model defined, returns null', () => {
    const dayTypesGenerator = dayTypesAfter({
      workTimeModels
    }, LocalDate.parse('2000-01-01'))

    const dayTypes = Array
      .from({ length: 2 })
      .map(() => dayTypesGenerator.next().value)

    assertThat(dayTypes, hasProperties({
      0: hasProperties({
        date: LocalDate.parse('2000-01-01'),
        parts: contains(hasProperties({ type: 'restday' }))
      }),
      1: hasProperties({
        date: LocalDate.parse('2000-01-02'),
        parts: contains(hasProperties({ type: 'workday' }))
      })
    }))
  })
})
