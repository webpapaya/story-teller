// @ts-ignore
import { assertThat, equalTo } from 'hamjest'
import { LocalDate } from 'js-joda'
import { calculateEasterSunday } from './calculate-easter-sunday'

describe('calculateEaster', () => {
  [
    { year: 2000, date: '2000-04-23' },
    { year: 2019, date: '2019-04-21' },
    { year: 2020, date: '2020-04-12' },
    { year: 2040, date: '2040-04-01' }
  ].forEach(({ year, date }) => {
    it(`in year ${year}, easter is on ${date}`, () => {
      assertThat(calculateEasterSunday(year),
        equalTo(LocalDate.parse(date)))
    })
  })
})
