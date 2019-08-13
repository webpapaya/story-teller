// @ts-ignore
import { assertThat, equalTo } from 'hamjest'
import { LocalDate } from 'js-joda'
import {
  calculateCatholicEasterSunday,
  calculateOrthodoxEasterSunday
} from './calculate-easter-sunday'

describe('calculateCatholicEasterSunday', () => {
  [
    { year: 2000, date: '2000-04-23' },
    { year: 2019, date: '2019-04-21' },
    { year: 2020, date: '2020-04-12' },
    { year: 2040, date: '2040-04-01' }
  ].forEach(({ year, date }) => {
    it(`in year ${year}, easter is on ${date}`, () => {
      assertThat(calculateCatholicEasterSunday(year),
        equalTo(LocalDate.parse(date)))
    })
  })
})

describe('calculateOrthodoxEasterSunday', () => {
  [
    { year: 2020, date: '2020-04-19' },
    { year: 2024, date: '2024-05-05' },
    { year: 2029, date: '2029-04-08' }
  ].forEach(({ year, date }) => {
    it(`in year ${year}, easter is on ${date}`, () => {
      assertThat(calculateOrthodoxEasterSunday(year),
        equalTo(LocalDate.parse(date)))
    })
  })
})
