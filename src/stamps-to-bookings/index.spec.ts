// @ts-ignore
import { assertThat, hasProperties, hasProperty } from 'hamjest'
import { ZonedDateTime, Duration, LocalTime, LocalDate } from 'js-joda'
import { stampsToBookings } from '.'
import { stampFactory, configFactory } from '../factories'

describe('stampsToBooking', () => {
  describe('generats bookings correctly with stamps:', () => {
    it('start, stop', () => {
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

      assertThat(stampsToBookings(configFactory.build(), stamps)[0], hasProperties({
        from: stamps[0].timestamp,
        until: stamps[1].timestamp
      }))
    })

    it('start, start, stop', () => {
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

      assertThat(stampsToBookings(configFactory.build(), stamps), hasProperties({
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

    it('start, stop, start, stop', () => {
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

      assertThat(stampsToBookings(configFactory.build(), stamps), hasProperties({
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

    it('stop, stop', () => {
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

      assertThat(stampsToBookings(configFactory.build(), stamps), hasProperty('length', 0))
    })

    it('start, stop', () => {
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

      assertThat(stampsToBookings(configFactory.build(), stamps), hasProperty('length', 1))
    })

    it('start, break', () => {
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

      assertThat(stampsToBookings(configFactory.build(), stamps), hasProperties({
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

  describe('correlationDate', () => {
    describe('threshold', () => {
      it('all stamps are on same day (date of first stamp)', () => {
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

        assertThat(stampsToBookings(configFactory.build(), stamps), hasProperties({
          0: hasProperty('correlationDate', stamps[0].timestamp.toLocalDate())
        }))
      })

      it('stamps pass dateline (date of first stamp)', () => {
        const stamps = [
          stampFactory.build({
            timestamp: ZonedDateTime.parse('2000-01-01T23:00:00Z'),
            type: 'Start'
          }),
          stampFactory.build({
            timestamp: ZonedDateTime.parse('2000-01-02T01:00:00Z'),
            type: 'Start'
          }),
          stampFactory.build({
            timestamp: ZonedDateTime.parse('2000-01-02T02:00:00Z'),
            type: 'Stop'
          })
        ]

        assertThat(stampsToBookings(configFactory.build(), stamps), hasProperties({
          0: hasProperty('correlationDate', stamps[0].timestamp.toLocalDate()),
          1: hasProperty('correlationDate', stamps[0].timestamp.toLocalDate())
        }))
      })

      it('with small gap below threshold (date of first stamp)', () => {
        const stamps = [
          stampFactory.build({
            timestamp: ZonedDateTime.parse('2000-01-01T23:00:00Z'),
            type: 'Start'
          }),
          stampFactory.build({
            timestamp: ZonedDateTime.parse('2000-01-02T01:00:00Z'),
            type: 'Stop'
          }),
          stampFactory.build({
            timestamp: ZonedDateTime.parse('2000-01-02T01:00:05Z'),
            type: 'Start'
          }),
          stampFactory.build({
            timestamp: ZonedDateTime.parse('2000-01-02T02:00:00Z'),
            type: 'Stop'
          })

        ]

        assertThat(stampsToBookings(configFactory.build({
          correlationDate: { threshold: Duration.ofMinutes(1) }
        }), stamps), hasProperties({
          0: hasProperty('correlationDate', stamps[0].timestamp.toLocalDate()),
          1: hasProperty('correlationDate', stamps[0].timestamp.toLocalDate())
        }))
      })

      it('with small gap exactly on threshold (date of first stamp)', () => {
        const stamps = [
          stampFactory.build({
            timestamp: ZonedDateTime.parse('2000-01-01T23:00:00Z'),
            type: 'Start'
          }),
          stampFactory.build({
            timestamp: ZonedDateTime.parse('2000-01-02T01:00:00Z'),
            type: 'Stop'
          }),
          stampFactory.build({
            timestamp: ZonedDateTime.parse('2000-01-02T01:01:00Z'),
            type: 'Start'
          }),
          stampFactory.build({
            timestamp: ZonedDateTime.parse('2000-01-02T02:00:00Z'),
            type: 'Stop'
          })
        ]

        assertThat(stampsToBookings(configFactory.build({
          correlationDate: { threshold: Duration.ofMinutes(1) }
        }), stamps), hasProperties({
          0: hasProperty('correlationDate', stamps[0].timestamp.toLocalDate()),
          1: hasProperty('correlationDate', stamps[0].timestamp.toLocalDate())
        }))
      })

      it('when big gap on next day (date of start stamp)', () => {
        const stamps = [
          stampFactory.build({
            timestamp: ZonedDateTime.parse('2000-01-01T23:00:00Z'),
            type: 'Start'
          }),
          stampFactory.build({
            timestamp: ZonedDateTime.parse('2000-01-02T01:00:00Z'),
            type: 'Stop'
          }),
          stampFactory.build({
            timestamp: ZonedDateTime.parse('2000-01-02T02:00:00Z'),
            type: 'Start'
          }),
          stampFactory.build({
            timestamp: ZonedDateTime.parse('2000-01-02T03:00:00Z'),
            type: 'Stop'
          })
        ]

        assertThat(stampsToBookings(configFactory.build({
          correlationDate: { threshold: Duration.ofMinutes(1) }
        }), stamps), hasProperties({
          0: hasProperty('correlationDate', stamps[0].timestamp.toLocalDate()),
          1: hasProperty('correlationDate', stamps[2].timestamp.toLocalDate())
        }))
      })
    })

    describe('position', () => {
      const stamps = [
        stampFactory.build({
          timestamp: ZonedDateTime.parse('2000-01-01T23:00:00Z'),
          type: 'Start'
        }),
        stampFactory.build({
          timestamp: ZonedDateTime.parse('2000-01-02T01:00:00Z'),
          type: 'Stop'
        })
      ]

      it('start', () => {
        assertThat(stampsToBookings(configFactory.build({
          correlationDate: { position: 'start' }
        }), stamps), hasProperties({
          0: hasProperty('correlationDate', stamps[0].timestamp.toLocalDate())
        }))
      })

      it('middle', () => {
        assertThat(stampsToBookings(configFactory.build({
          correlationDate: { position: 'center' }
        }), stamps), hasProperties({
          0: hasProperty('correlationDate', stamps[1].timestamp.toLocalDate())
        }))
      })

      it('end', () => {
        assertThat(stampsToBookings(configFactory.build({
          correlationDate: { position: 'end' }
        }), stamps), hasProperties({
          0: hasProperty('correlationDate', stamps[1].timestamp.toLocalDate())
        }))
      })
    })

    describe('startOfDay', () => {
      const stamps = [
        stampFactory.build({
          timestamp: ZonedDateTime.parse('2000-01-02T00:00:00Z'),
          type: 'Start'
        }),
        stampFactory.build({
          timestamp: ZonedDateTime.parse('2000-01-02T01:00:00Z'),
          type: 'Stop'
        })
      ]

      it('when day starts at noon, times will be shifted to previous day', () => {
        assertThat(stampsToBookings(configFactory.build({
          correlationDate: { startOfDay: LocalTime.NOON }
        }), stamps), hasProperties({
          0: hasProperty('correlationDate', LocalDate.parse('2000-01-01'))
        }))
      })
    })
  })
})
