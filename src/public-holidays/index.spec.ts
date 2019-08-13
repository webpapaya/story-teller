// @ts-ignore
import { assertThat, hasProperties } from 'hamjest'
import * as Factory from 'factory.ts'
import { FixedDate, CatholicEasterBased, OrthodoxEasterBased, FirstWeekdayInMonth, Weekday, LastWeekdayInMonth, WeekdayOnOrAfterDate, WeekdayOnOrBeforeDate } from './types'
import { LocalDate } from 'js-joda'
import { resolveHoliday } from './index'

export const fixedDateHolidayFactory = Factory.Sync.makeFactory<FixedDate>({
  month: 1,
  day: 1,
  name: 'New Year',
  kind: 'fixedDate'
})

export const catholicEasterHolidayFactory = Factory.Sync.makeFactory<CatholicEasterBased>({
  easterOffset: 0,
  name: 'Easter Sunday',
  kind: 'catholicEasterBased'
})

export const orthodoxEasterHolidayFactory = Factory.Sync.makeFactory<OrthodoxEasterBased>({
  easterOffset: 0,
  name: 'Easter Sunday',
  kind: 'orthodoxEasterBased'
})

export const firstWeekdayInMonthHolidayFactory = Factory.Sync.makeFactory<FirstWeekdayInMonth>({
  month: 1,
  weekday: 'MONDAY',
  ordinalOffset: 0,
  name: 'Easter Sunday',
  kind: 'firstWeekdayInMonth'
})

export const lastWeekdayInMonthHolidayFactory = Factory.Sync.makeFactory<LastWeekdayInMonth>({
  month: 1,
  weekday: 'MONDAY',
  ordinalOffset: 0,
  name: 'Easter Sunday',
  kind: 'lastWeekdayInMonth'
})

export const weekdayOnOrBeforeHolidayFactory = Factory.Sync.makeFactory<WeekdayOnOrBeforeDate>({
  month: 1,
  day: 1,
  weekday: 'MONDAY',
  name: 'Easter Sunday',
  kind: 'weekdayOnOrBeforeDate'
})

export const weekdayOnOrAfterHolidayFactory = Factory.Sync.makeFactory<WeekdayOnOrAfterDate>({
  month: 1,
  day: 1,
  weekday: 'MONDAY',
  name: 'Easter Sunday',
  kind: 'weekdayOnOrAfterDate'
})

describe('fixedDate', () => {
  it('New Year in 2000 is on 2000-01-01', () => {
    const holiday = fixedDateHolidayFactory.build()
    assertThat(resolveHoliday(holiday, 2000), hasProperties({
      name: holiday.name,
      date: LocalDate.of(2000, holiday.month, holiday.day)
    }))
  })
})

describe('catholicEasterBased', () => {
  [
    { year: 2000, easterOffset: 0, date: '2000-04-23' },
    { year: 2000, easterOffset: 1, date: '2000-04-24' },
    { year: 2000, easterOffset: -1, date: '2000-04-22' }
  ].forEach(({ year, easterOffset, date }) => {
    it(`in year ${year} with easterOffset ${easterOffset}, returns ${date}`, () => {
      const holiday = catholicEasterHolidayFactory.build({ easterOffset })
      assertThat(resolveHoliday(holiday, year), hasProperties({
        date: LocalDate.parse(date)
      }))
    })
  })

  it('uses correct name', () => {
    const holiday = catholicEasterHolidayFactory.build()
    assertThat(resolveHoliday(holiday, 2000), hasProperties({
      name: holiday.name
    }))
  })
})

describe('orthodoxEasterBased', () => {
  [
    { year: 2000, easterOffset: 0, date: '2000-04-30' },
    { year: 2000, easterOffset: 1, date: '2000-05-01' },
    { year: 2000, easterOffset: -1, date: '2000-04-29' }
  ].forEach(({ year, easterOffset, date }) => {
    it(`in year ${year} with easterOffset ${easterOffset}, returns ${date}`, () => {
      const holiday = orthodoxEasterHolidayFactory.build({ easterOffset })
      assertThat(resolveHoliday(holiday, year), hasProperties({
        date: LocalDate.parse(date)
      }))
    })
  })

  it('uses correct name', () => {
    const holiday = orthodoxEasterHolidayFactory.build()
    assertThat(resolveHoliday(holiday, 2000), hasProperties({
      name: holiday.name
    }))
  })
})

describe('firstWeekdayInMonth', () => {
  [
    { year: 2000, ordinalOffset: 0, month: 1, weekday: 'SUNDAY', date: '2000-01-02' },
    { year: 2000, ordinalOffset: 0, month: 1, weekday: 'SATURDAY', date: '2000-01-01' },
    { year: 2000, ordinalOffset: 1, month: 1, weekday: 'SATURDAY', date: '2000-01-08' }
  ].forEach(({ year, month, ordinalOffset, weekday, date }) => {
    it(`in month ${year}-${month}, ${ordinalOffset + 1}. ${weekday} is ${date}`, () => {
      const holiday = firstWeekdayInMonthHolidayFactory.build({
        month: 1,
        weekday: weekday as Weekday,
        ordinalOffset
      })
      assertThat(resolveHoliday(holiday, year), hasProperties({
        date: LocalDate.parse(date)
      }))
    })
  })

  it('uses correct name', () => {
    const holiday = firstWeekdayInMonthHolidayFactory.build()
    assertThat(resolveHoliday(holiday, 2000), hasProperties({
      name: holiday.name
    }))
  })
})

describe('lastWeekdayInMonth', () => {
  [
    { year: 2000, ordinalOffset: 0, month: 1, weekday: 'SUNDAY', date: '2000-01-30' },
    { year: 2000, ordinalOffset: 0, month: 1, weekday: 'SATURDAY', date: '2000-01-29' },
    { year: 2000, ordinalOffset: 1, month: 1, weekday: 'SATURDAY', date: '2000-01-22' }
  ].forEach(({ year, month, ordinalOffset, weekday, date }) => {
    it(`in month ${year}-${month} ${ordinalOffset + 1}. ${weekday} is ${date}`, () => {
      const holiday = lastWeekdayInMonthHolidayFactory.build({
        month: 1,
        weekday: weekday as Weekday,
        ordinalOffset
      })
      assertThat(resolveHoliday(holiday, year), hasProperties({
        date: LocalDate.parse(date)
      }))
    })
  })

  it('uses correct name', () => {
    const holiday = lastWeekdayInMonthHolidayFactory.build()
    assertThat(resolveHoliday(holiday, 2000), hasProperties({
      name: holiday.name
    }))
  })
})

describe('resolveWeekdayOnOrBeforeDate', () => {
  [
    { year: 2000, month: 1, day: 10, weekday: 'SUNDAY', date: '2000-01-09' }
  ].forEach(({ year, month, day, weekday, date }) => {
    it(`first ${weekday} before ${year}-${month}-${day} is ${date}`, () => {
      const holiday = weekdayOnOrBeforeHolidayFactory.build({
        day,
        month,
        weekday: weekday as Weekday
      })
      assertThat(resolveHoliday(holiday, year), hasProperties({
        date: LocalDate.parse(date)
      }))
    })
  })

  it('uses correct name', () => {
    const holiday = weekdayOnOrBeforeHolidayFactory.build()
    assertThat(resolveHoliday(holiday, 2000), hasProperties({
      name: holiday.name
    }))
  })
})

describe('resolveWeekdayOnOrAfterDate', () => {
  [
    { year: 2000, month: 1, day: 10, weekday: 'SUNDAY', date: '2000-01-16' }
  ].forEach(({ year, month, day, weekday, date }) => {
    it(`first ${weekday} after ${year}-${month}-${day} is ${date}`, () => {
      const holiday = weekdayOnOrAfterHolidayFactory.build({
        day,
        month,
        weekday: weekday as Weekday
      })
      assertThat(resolveHoliday(holiday, year), hasProperties({
        date: LocalDate.parse(date)
      }))
    })
  })

  it('uses correct name', () => {
    const holiday = weekdayOnOrAfterHolidayFactory.build()
    assertThat(resolveHoliday(holiday, 2000), hasProperties({
      name: holiday.name
    }))
  })
})
