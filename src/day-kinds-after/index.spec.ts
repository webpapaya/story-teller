// @ts-ignore
import { assertThat, hasProperties, contains } from 'hamjest'
import { LocalDate, Duration } from 'js-joda'
import { dayKindsAfter } from '.'
import {
  workTimeModelFactory,
  multiDayAbsenceFactory,
  singleDayAbsenceFactory,
  fixedDateHolidayFactory
} from '../factories'

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
      workTimeModels: [],
      absences: [],
      holidays: []
    }, LocalDate.parse('2000-01-01'))

    assertThat(dayTypesGenerator.next().value, hasProperties({
      date: LocalDate.parse('2000-01-01'),
      parts: contains(hasProperties({ type: 'restday' }))
    }))
  })

  it('single day absences are taken into account', () => {
    const dayTypesGenerator = dayKindsAfter({
      absences: singleDayAbsences,
      workTimeModels: [],
      holidays: []
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
      absences: multiDayAbsences,
      workTimeModels: [],
      holidays: []
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
      absences: [],
      workTimeModels: [...workTimeModels].reverse(),
      holidays: []
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

  it('public holidays are taken into account', () => {
    const dayTypesGenerator = dayKindsAfter({
      absences: [],
      workTimeModels: [],
      holidays: [
        fixedDateHolidayFactory.build({
          day: 1,
          month: 1
        })
      ]
    }, LocalDate.parse('2000-01-01'))

    const dayTypes = Array
      .from({ length: 2 })
      .map(() => dayTypesGenerator.next().value)

    assertThat(dayTypes, hasProperties({
      0: hasProperties({
        date: LocalDate.parse('2000-01-01'),
        parts: contains(hasProperties({ type: 'holiday' }))
      }),
      1: hasProperties({
        date: LocalDate.parse('2000-01-02'),
        parts: contains(hasProperties({ type: 'restday' }))
      })
    }))
  })
})
