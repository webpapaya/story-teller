import * as Factory from 'factory.ts'
import {
  WorkTimeModel,
  SingleDayAbsence,
  MultiDayAbsence,
  PrioritizedDayPart,
  Booking,
  Config,
  Stamp,
  FixedDate,
  CatholicEasterBased,
  OrthodoxEasterBased,
  FirstWeekdayInMonth,
  LastWeekdayInMonth,
  WeekdayOnOrAfterDate,
  WeekdayOnOrBeforeDate
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

export const dayPartFactory = Factory.Sync.makeFactory<PrioritizedDayPart>({
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

export const fixedDateHolidayFactory = Factory.Sync.makeFactory<FixedDate>({
  month: 1,
  day: 1,
  name: 'New Year',
  kind: 'fixedDate',
  offset: 0,
  duration: 1,
  validFrom: null,
  validUntil: null
})

export const catholicEasterHolidayFactory = Factory.Sync.makeFactory<CatholicEasterBased>({
  easterOffset: 0,
  name: 'Easter Sunday',
  kind: 'catholicEasterBased',
  offset: 0,
  duration: 1,
  validFrom: null,
  validUntil: null

})

export const orthodoxEasterHolidayFactory = Factory.Sync.makeFactory<OrthodoxEasterBased>({
  easterOffset: 0,
  name: 'Easter Sunday',
  kind: 'orthodoxEasterBased',
  offset: 0,
  duration: 1,
  validFrom: null,
  validUntil: null

})

export const firstWeekdayInMonthHolidayFactory = Factory.Sync.makeFactory<FirstWeekdayInMonth>({
  month: 1,
  weekday: 'MONDAY',
  ordinalOffset: 0,
  name: 'Easter Sunday',
  kind: 'firstWeekdayInMonth',
  offset: 0,
  duration: 1,
  validFrom: null,
  validUntil: null

})

export const lastWeekdayInMonthHolidayFactory = Factory.Sync.makeFactory<LastWeekdayInMonth>({
  month: 1,
  weekday: 'MONDAY',
  ordinalOffset: 0,
  name: 'Easter Sunday',
  kind: 'lastWeekdayInMonth',
  offset: 0,
  duration: 1,
  validFrom: null,
  validUntil: null

})

export const weekdayOnOrBeforeHolidayFactory = Factory.Sync.makeFactory<WeekdayOnOrBeforeDate>({
  month: 1,
  day: 1,
  weekday: 'MONDAY',
  name: 'Easter Sunday',
  kind: 'weekdayOnOrBeforeDate',
  offset: 0,
  duration: 1,
  validFrom: null,
  validUntil: null

})

export const weekdayOnOrAfterHolidayFactory = Factory.Sync.makeFactory<WeekdayOnOrAfterDate>({
  month: 1,
  day: 1,
  weekday: 'MONDAY',
  name: 'Easter Sunday',
  kind: 'weekdayOnOrAfterDate',
  offset: 0,
  duration: 1,
  validFrom: null,
  validUntil: null
})
