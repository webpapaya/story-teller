// @ts-ignore
import { assertThat, hasProperties, hasProperty } from 'hamjest'
import * as Factory from 'factory.ts'
import { Stamp } from './domain'
import { ZonedDateTime } from 'js-joda'
import { stampsToBookings } from './stamps-to-bookings'

const stampFactory = Factory.Sync.makeFactory<Stamp>({
  id: Factory.each(i => `${i}`),
  type: 'Start',
  timestamp: ZonedDateTime.parse('2000-01-01T00:00:00Z')
})

describe('stampsToBooking', () => {
  it('start, stop stamps generates correct booking', () => {
    const stamps = [
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T00:00:00Z'),
        type: 'Start'
      }),
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T01:00:00Z'),
        type: 'Stop'
      })
    ]

    assertThat(stampsToBookings(stamps)[0], hasProperties({
      from: stamps[0].timestamp,
      until: stamps[1].timestamp
    }))
  })

  it('start, start, stop stamps generates correct booking', () => {
    const stamps = [
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T00:00:00Z'),
        type: 'Start'
      }),
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T00:30:00Z'),
        type: 'Start'
      }),
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T01:00:00Z'),
        type: 'Stop'
      })
    ]

    assertThat(stampsToBookings(stamps), hasProperties({
      0: hasProperties({
        from: stamps[0].timestamp,
        until: stamps[1].timestamp
      }),
      1: hasProperties({
        from: stamps[1].timestamp,
        until: stamps[2].timestamp
      })
    }))
  })

  it('start, stop, start, stop stamps generates two bookings', () => {
    const stamps = [
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T00:00:00Z'),
        type: 'Start'
      }),
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T00:30:00Z'),
        type: 'Stop'
      }),
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T01:00:00Z'),
        type: 'Start'
      }),
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T01:30:00Z'),
        type: 'Stop'
      })
    ]

    assertThat(stampsToBookings(stamps), hasProperties({
      0: hasProperties({
        from: stamps[0].timestamp,
        until: stamps[1].timestamp
      }),
      1: hasProperties({
        from: stamps[2].timestamp,
        until: stamps[3].timestamp
      })
    }))
  })

  it('stop, stop does NOT generate a booking', () => {
    const stamps = [
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T00:00:00Z'),
        type: 'Stop'
      }),
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T00:30:00Z'),
        type: 'Stop'
      })
    ]

    assertThat(stampsToBookings(stamps), hasProperty('length', 0))
  })

  it('start, stop, stop generates 1 booking', () => {
    const stamps = [
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T00:00:00Z'),
        type: 'Start'
      }),
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T00:30:00Z'),
        type: 'Stop'
      }),
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T01:00:00Z'),
        type: 'Stop'
      })
    ]

    assertThat(stampsToBookings(stamps), hasProperty('length', 1))
  })

  it('start, break, stop generates 2 booking', () => {
    const stamps = [
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T00:00:00Z'),
        type: 'Start'
      }),
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T00:30:00Z'),
        type: 'Break'
      }),
      stampFactory.build({
        timestamp: ZonedDateTime.parse('2000-01-01T01:00:00Z'),
        type: 'Stop'
      })
    ]

    assertThat(stampsToBookings(stamps), hasProperties({
      0: hasProperties({
        type: 'Work',
        from: stamps[0].timestamp,
        until: stamps[1].timestamp
      }),
      1: hasProperties({
        type: 'Break',
        from: stamps[1].timestamp,
        until: stamps[2].timestamp
      })
    }))
  })
})
