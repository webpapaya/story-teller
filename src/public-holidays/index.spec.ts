// @ts-ignore
import { assertThat, hasProperties } from 'hamjest'
import * as Factory from 'factory.ts'
import { FixedDate, CatholicEasterBased, OrthodoxEasterBased, FirstWeekdayInMonth, Weekday, LastWeekdayInMonth } from './types'
import { LocalDate } from 'js-joda'
import {
  resolveFixedDate,
  resolveCatholicEaster,
  resolveOrthodoxEaster,
  resolveFirstWeekdayInMonth,
  resolveLastWeekdayInMonth
} from './index'

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

describe('fixedDate', () => {
  it('New Year in 2000 is on 2000-01-01', () => {
    const holiday = fixedDateHolidayFactory.build()
    assertThat(resolveFixedDate(holiday, 2000), hasProperties({
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
      assertThat(resolveCatholicEaster(holiday, year), hasProperties({
        date: LocalDate.parse(date)
      }))
    })
  })

  it('uses correct name', () => {
    const holiday = catholicEasterHolidayFactory.build()
    assertThat(resolveCatholicEaster(holiday, 2000), hasProperties({
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
      assertThat(resolveOrthodoxEaster(holiday, year), hasProperties({
        date: LocalDate.parse(date)
      }))
    })
  })

  it('uses correct name', () => {
    const holiday = orthodoxEasterHolidayFactory.build()
    assertThat(resolveOrthodoxEaster(holiday, 2000), hasProperties({
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
      assertThat(resolveFirstWeekdayInMonth(holiday, year), hasProperties({
        date: LocalDate.parse(date)
      }))
    })
  })

  it('uses correct name', () => {
    const holiday = firstWeekdayInMonthHolidayFactory.build()
    assertThat(resolveFirstWeekdayInMonth(holiday, 2000), hasProperties({
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
      assertThat(resolveLastWeekdayInMonth(holiday, year), hasProperties({
        date: LocalDate.parse(date)
      }))
    })
  })

  it('uses correct name', () => {
    const holiday = firstWeekdayInMonthHolidayFactory.build()
    assertThat(resolveFirstWeekdayInMonth(holiday, 2000), hasProperties({
      name: holiday.name
    }))
  })
})
