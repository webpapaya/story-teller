import { LocalDate, LocalDateTime, ZoneOffset } from 'js-joda'
import { Validation, Ok, Err, Codec } from './types'
import { matchesRegex, union } from './primitives'
import { randBetween } from './utils'
import RandExp from 'randexp'

export const clampedString = (minLength: number, maxLength: number) => new Validation<string>({
  name: `clampedString(min: ${minLength}, max: ${maxLength})`,
  decode: (input, context) => {
    const message =
      maxLength === Number.POSITIVE_INFINITY
        ? `needs to be longer than ${minLength} characters`
        : `needs to be between ${minLength} and ${maxLength} characters`

    return typeof input === 'string' && input.length >= minLength && input.length <= maxLength
      ? Ok(input)
      : Err([{ message, context }])
  },
  build: () => [
    () => {
      const length = maxLength === Number.POSITIVE_INFINITY
        ? Number.MAX_SAFE_INTEGER
        : maxLength

      return new RandExp(new RegExp(`.{${minLength}, ${length}}`)).gen()
    }
  ]
})

export const nonEmptyString = clampedString(1, Number.POSITIVE_INFINITY)
export const color = matchesRegex('color', /^#[0-9A-F]{6}$/i)
export const uuid = matchesRegex('uuid', /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}){1}/i)

export const date = new Codec<string, LocalDate, unknown>({
  name: 'date',
  is: (value) => value instanceof LocalDate,
  decode: (input, context) => {
    const error = Err([{ message: 'needs to be an ISO string', context }])
    if (typeof input !== 'string') { return error }
    try {
      return Ok(LocalDate.parse(input))
    } catch (e) {
      return error
    }
  },
  encode: (input) => input.toString(),
  build: () => [
    () => {
      const year = LocalDate.ofYearDay(randBetween(1900, 2200), 1)
      return year.isLeapYear()
        ? LocalDate.ofYearDay(year.year(), randBetween(1, 366))
        : LocalDate.ofYearDay(year.year(), randBetween(1, 365))
    }
  ]
})

export const dateInFuture = date.pipe({
  name: 'dateInFuture',
  decode: (input, context) => {
    const now = LocalDate.now()
    return input.isAfter(now)
      ? Ok(input)
      : Err([{ message: 'date must be in the future', context }])
  },
  build: () => [
    () => LocalDate.now().plusDays(randBetween(1, 365 * 200))
  ]
})

export const dateInPast = date.pipe({
  name: 'dateInPast',
  decode: (input, context) => {
    const now = LocalDate.now()
    return input.isBefore(now)
      ? Ok(input)
      : Err([{ message: 'date must be in the past', context }])
  },
  build: () => [
    () => LocalDate.now().minusDays(randBetween(1, 365 * 200))
  ]
})

export const dateToday = date.pipe({
  name: 'dateToday',
  decode: (input, context) => {
    const now = LocalDate.now()
    return input.isEqual(now)
      ? Ok(input)
      : Err([{ message: 'date must be today', context }])
  },
  build: () => [
    () => LocalDate.now()
  ]
})

export const dateInFutureOrToday = union([dateToday, dateInFuture])
export const dateInPastOrToday = union([dateToday, dateInPast])

export const localDateTime = new Codec<string, LocalDateTime, unknown>({
  name: 'localDateTime',
  is: (value) => value instanceof LocalDateTime,
  decode: (input, context) => {
    const error = Err([{ message: 'needs to be an ISO string', context }])
    if (typeof input !== 'string') { return error }
    try {
      return Ok(LocalDateTime.parse(input))
    } catch (e) {
      return error
    }
  },
  encode: (input) => input.toString(),
  build: () => [
    () => LocalDateTime.ofEpochSecond(randBetween(0, Number.MAX_SAFE_INTEGER), ZoneOffset.UTC)
  ]
})

export {
  record,
  valueObject,
  entity,
  aggregate,
  array,
  union,
  literal,
  literalUnion,
  nullCodec,
  undefinedCodec,
  option,
  nullable,
  number,
  string,
  boolean,
  matchesRegex
} from './primitives'
