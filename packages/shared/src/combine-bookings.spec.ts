// @ts-ignore
import { assertThat, hasProperties, hasProperty } from 'hamjest'
import { ZonedDateTime } from 'js-joda'
import { combineBookings } from './combine-bookings'
import { bookingFactory } from './factories'

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
