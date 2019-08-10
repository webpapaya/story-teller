// @ts-ignore
import { assertThat, hasProperties, contains } from 'hamjest'
import { LocalDate, Duration } from 'js-joda'
import { dayKindsAfter } from './day-kinds-after'
import {
  workTimeModelFactory,
  multiDayAbsenceFactory,
  singleDayAbsenceFactory
} from './factories'

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

  const singleDayAbsences = [
    singleDayAbsenceFactory.build({
      date: LocalDate.parse('2000-01-01')
    }),
    singleDayAbsenceFactory.build({
      date: LocalDate.parse('2000-01-02'),
      offset: 0.25,
      duration: 0.5
    })
  ]

  const multiDayAbsences = [
    multiDayAbsenceFactory.build({
      from: LocalDate.parse('2000-01-01'),
      until: LocalDate.parse('2000-01-03'),
      morningOffset: 0.5,
      eveningOffset: 0.5
    })
  ]

  it('returns rest day without work time model', () => {
    const dayTypesGenerator = dayKindsAfter({
      workTimeModels: []
    }, LocalDate.parse('2000-01-01'))

    assertThat(dayTypesGenerator.next().value, hasProperties({
      date: LocalDate.parse('2000-01-01'),
      parts: contains(hasProperties({ type: 'restday' }))
    }))
  })

  it('single day absences are taken into account', () => {
    const dayTypesGenerator = dayKindsAfter({
      absences: singleDayAbsences
    }, LocalDate.parse('2000-01-01'))

    const dayTypes = Array
      .from({ length: 2 })
      .map(() => dayTypesGenerator.next().value)

    assertThat(dayTypes, hasProperties({
      0: hasProperties({
        date: LocalDate.parse('2000-01-01'),
        parts: contains(hasProperties({ type: 'absence' }))
      }),
      1: hasProperties({
        date: LocalDate.parse('2000-01-02'),
        parts: contains(
          hasProperties({ type: 'restday' }),
          hasProperties({ type: 'absence' }),
          hasProperties({ type: 'restday' })
        )
      })
    }))
  })

  it('multiday absences are taken into account', () => {
    const dayTypesGenerator = dayKindsAfter({
      absences: multiDayAbsences
    }, LocalDate.parse('2000-01-01'))

    const dayTypes = Array
      .from({ length: 3 })
      .map(() => dayTypesGenerator.next().value)

    assertThat(dayTypes, hasProperties({
      0: hasProperties({
        date: LocalDate.parse('2000-01-01'),
        parts: contains(
          hasProperties({ type: 'restday' }),
          hasProperties({ type: 'absence' })
        )
      }),
      1: hasProperties({
        date: LocalDate.parse('2000-01-02'),
        parts: contains(
          hasProperties({ type: 'absence' })
        )
      }),
      2: hasProperties({
        date: LocalDate.parse('2000-01-03'),
        parts: contains(
          hasProperties({ type: 'absence' }),
          hasProperties({ type: 'restday' })
        )
      })
    }))
  })

  it('versioning in work time models are taken into account', () => {
    const dayTypesGenerator = dayKindsAfter({
      workTimeModels: [...workTimeModels].reverse()
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
