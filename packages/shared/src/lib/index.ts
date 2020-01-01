import { LocalDate, LocalDateTime } from 'js-joda'
import { Validation, Ok, Err, Codec } from './types'
import { matchesRegex } from './primitives'

export const clampedString = (minLength: number, maxLength: number) => new Validation<string>(
  `clampedString(min: ${minLength}, max: ${maxLength})`,
  (input, context) => {
    const message =
      maxLength === Number.POSITIVE_INFINITY
        ? `needs to be longer than ${minLength} characters`
        : `needs to be between ${minLength} and ${maxLength} characters`

    return typeof input === 'string' && input.length >= minLength && input.length <= maxLength
      ? Ok(input)
      : Err([{ message, context }])
  }
)

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
  encode: (input) => input.toString()
})

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
  encode: (input) => input.toString()
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
