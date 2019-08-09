// @ts-ignore
import { assertThat, hasProperties, hasProperty } from 'hamjest'
import * as Factory from 'factory.ts'
import { ZonedDateTime, LocalDate } from 'js-joda'
import { Booking } from './domain'
import { combineBookings } from './combine-bookings'

const bookingFactory = Factory.Sync.makeFactory<Booking>({
  type: 'Work',
  from: ZonedDateTime.parse('2000-01-01T00:00Z'),
  until: ZonedDateTime.parse('2000-01-01T10:00Z'),
  correlationDate: LocalDate.parse('2000-01-01'),
  origin: []
})

describe('combineBookings', () => {
  it('single booking is returned as is', () => {
    assertThat(combineBookings([bookingFactory.build()]),
      hasProperty('length', 1))
  })

  it('two bookings are returned correctly', () => {
    assertThat(combineBookings([
      bookingFactory.build({
        from: ZonedDateTime.parse('2000-01-01T00:00Z'),
        until: ZonedDateTime.parse('2000-01-01T10:00Z')
      }),
      bookingFactory.build({
        from: ZonedDateTime.parse('2000-01-01T02:00Z'),
        until: ZonedDateTime.parse('2000-01-01T08:00Z')
      })
    ]), hasProperties({
      0: hasProperties({
        from: ZonedDateTime.parse('2000-01-01T00:00Z'),
        until: ZonedDateTime.parse('2000-01-01T02:00Z')
      }),
      1: hasProperties({
        from: ZonedDateTime.parse('2000-01-01T02:00Z'),
        until: ZonedDateTime.parse('2000-01-01T08:00Z')
      }),
      2: hasProperties({
        from: ZonedDateTime.parse('2000-01-01T08:00Z'),
        until: ZonedDateTime.parse('2000-01-01T10:00Z')
      })
    }))
  })
})
