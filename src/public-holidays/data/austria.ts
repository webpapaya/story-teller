import { PublicHolidayConfig } from '../../domain'
import { LocalDate } from 'js-joda'

export const PublicHolidays: PublicHolidayConfig[] = [
  {
    kind: 'fixedDate',
    name: 'New Year\'s Day',
    validFrom: LocalDate.of(1967, 1, 1),
    validUntil: null,
    day: 1,
    month: 1,
    offset: 0,
    duration: 1,
    counties: null
  }, {
    kind: 'fixedDate',
    name: 'Epiphany',
    validFrom: null,
    validUntil: null,
    day: 1,
    month: 6,
    offset: 0,
    duration: 1,
    counties: null
  }, {
    kind: 'catholicEasterBased',
    name: 'Easter Monday',
    validFrom: LocalDate.of(1642, 1, 1),
    validUntil: null,
    easterOffset: 1,
    offset: 0,
    duration: 1,
    counties: null
  }, {
    kind: 'fixedDate',
    name: 'National Holiday',
    validFrom: LocalDate.of(1955, 1, 1),
    validUntil: null,
    day: 1,
    month: 5,
    offset: 0,
    duration: 1,
    counties: null
  }, {
    kind: 'catholicEasterBased',
    name: 'Ascension Day',
    validFrom: null,
    validUntil: null,
    easterOffset: 39,
    offset: 0,
    duration: 1,
    counties: null
  }, {
    kind: 'catholicEasterBased',
    name: 'Whit Monday',
    validFrom: null,
    validUntil: null,
    easterOffset: 50,
    offset: 0,
    duration: 1,
    counties: null
  }, {
    kind: 'catholicEasterBased',
    name: 'Corpus Christy',
    validFrom: null,
    validUntil: null,
    easterOffset: 60,
    offset: 0,
    duration: 1,
    counties: null
  }, {
    kind: 'fixedDate',
    name: 'Assumption Day',
    validFrom: null,
    validUntil: null,
    month: 8,
    day: 15,
    offset: 0,
    duration: 1,
    counties: null
  }, {
    kind: 'fixedDate',
    name: 'National Holiday',
    validFrom: null,
    validUntil: null,
    day: 26,
    month: 10,
    offset: 0,
    duration: 1,
    counties: null
  }, {
    kind: 'fixedDate',
    name: 'All Saints\' Day',
    validFrom: null,
    validUntil: null,
    day: 1,
    month: 11,
    offset: 0,
    duration: 1,
    counties: null
  }, {
    kind: 'fixedDate',
    name: 'Immaculate Conception',
    validFrom: null,
    validUntil: null,
    day: 8,
    month: 12,
    offset: 0,
    duration: 1,
    counties: null
  }, {
    kind: 'fixedDate',
    name: 'Christmas',
    validFrom: null,
    validUntil: null,
    day: 24,
    month: 12,
    offset: 0.5,
    duration: 0.5,
    counties: null
  }, {
    kind: 'fixedDate',
    name: 'Christmas Day',
    validFrom: null,
    validUntil: null,
    day: 25,
    month: 12,
    offset: 0,
    duration: 1,
    counties: null
  }, {
    kind: 'fixedDate',
    name: 'St. Stephen\'s Day',
    validFrom: null,
    validUntil: null,
    day: 26,
    month: 12,
    offset: 0,
    duration: 1,
    counties: null
  }, {
    kind: 'fixedDate',
    name: 'New Year\'s Eve',
    validFrom: null,
    validUntil: null,
    day: 31,
    month: 12,
    offset: 0.5,
    duration: 0.5,
    counties: null
  }
]
