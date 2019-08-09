import { Booking } from './domain'
import { combineTimeFrames } from './combine-time-frames'
import { ZonedDateTime, LocalDateTime, ZoneOffset } from 'js-joda'

export const combineBookings = combineTimeFrames<Booking>({
  getOffset: (booking) => booking.from.toEpochSecond(),
  setOffset: (booking, value) => {
    booking.from = ZonedDateTime.of(
      LocalDateTime.ofEpochSecond(value, ZoneOffset.UTC),
      booking.from.zone()
    )
    return booking
  },

  getDuration: (booking) =>
    booking.until.toEpochSecond() - booking.from.toEpochSecond(),

  setDuration: (booking, value) => {
    booking.until = booking.from.plusSeconds(value)
    return booking
  },

  orderFn: () => 0
})
