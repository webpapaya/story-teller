import * as Factory from 'factory.ts'
import {
  WorkTimeModel,
  SingleDayAbsence,
  MultiDayAbsence,
  DayPart,
  Booking,
  Config,
  Stamp
} from './domain'
import { LocalDate, ZonedDateTime, Duration, LocalTime } from 'js-joda'

export const workTimeModelFactory = Factory.Sync.makeFactory<WorkTimeModel>({
  MONDAY: null,
  TUESDAY: null,
  WEDNESDAY: null,
  THURSDAY: null,
  FRIDAY: null,
  SATURDAY: null,
  SUNDAY: null,
  validFrom: null
})

export const singleDayAbsenceFactory = Factory.Sync.makeFactory<SingleDayAbsence>({
  date: LocalDate.parse('2000-01-01'),
  duration: 1,
  offset: 0,
  kind: 'singleDay'
})

export const multiDayAbsenceFactory = Factory.Sync.makeFactory<MultiDayAbsence>({
  kind: 'multiday',
  from: LocalDate.parse('2000-01-01'),
  until: LocalDate.parse('2000-01-01'),
  morningOffset: 0,
  eveningOffset: 0
})

export const dayPartFactory = Factory.Sync.makeFactory<DayPart>({
  offset: 0,
  duration: 1,
  type: 'daykind',
  priority: 0
})

export const bookingFactory = Factory.Sync.makeFactory<Booking>({
  type: 'Work',
  from: ZonedDateTime.parse('2000-01-01T00:00Z'),
  until: ZonedDateTime.parse('2000-01-01T10:00Z'),
  correlationDate: LocalDate.parse('2000-01-01'),
  origin: []
})

export const stampFactory = Factory.Sync.makeFactory<Stamp>({
  id: Factory.each(i => `${i}`),
  type: 'Start',
  timestamp: ZonedDateTime.parse('2000-01-01T00:00:00Z')
})

export const configFactory = Factory.Sync.makeFactory<Config>({
  correlationDate: {
    startOfDay: LocalTime.MIDNIGHT,
    threshold: Duration.ZERO,
    position: 'start'
  }
})
