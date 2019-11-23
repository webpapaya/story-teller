import { Validation, Ok, Err, AnyCodec } from './types'
import { record, option, array, literal, matchesRegex } from './primitives'

const uuid = matchesRegex('uuid', /^#[0-9A-F]{6}$/i)
const email = matchesRegex('email', /^.+@.+\..+$/i)
const phone = matchesRegex('phone', /^(\+[0-9]{1,} |0)[1-9]{2,} [0-9]{2,}(\-[0-9]{1,}|)$/i)

const clampedString = (minLength: number, maxLength: number) => new Validation<string>(
  'clampedString',
  (input, context) => {
    return typeof input === 'string' && input.length < minLength && input.length > maxLength
      ? Ok(input)
      : Err([{ message: `can't be longer than ${maxLength} chars`, context }])
  }
)

const nonNullableString = new Validation<string>(
  'nonNullableString',
  (input, context) => {
    return typeof input === 'string' && input.length > 0
      ? Ok(input)
      : Err([{ message: `can't be empty`, context }])
  }
)

const withRequiredStandard = <T extends AnyCodec>(schema: T) => record({
  standard: schema,
  others: array(schema)
})

const residence = record({
  addressAppendix: nonNullableString,
  streetAppendix: nonNullableString,
  city: nonNullableString,
  country: nonNullableString,
  streetName: nonNullableString,
  zipCode: clampedString(1, 5),
})

const address = record({
  addressAppendix: nonNullableString,
  streetAppendix: nonNullableString,
  city: nonNullableString,
  country: nonNullableString,
  streetName: nonNullableString,
  zipCode: clampedString(1, 5),
})

const person = record({
  id: uuid,
  name: nonNullableString,
  residence: residence,
  deliveryAddress: option(withRequiredStandard(address)),
  contact: record({
    email: option(withRequiredStandard(email)),
    phone: option(withRequiredStandard(phone)),
    mobile: option(withRequiredStandard(phone)),
  }),
})

const beforeAndAfterEvent =  <T extends AnyCodec>(namespace: string, type: string, schema: T) => record({
  namespace: literal(namespace),
  type: literal(type),
  before: schema,
  after: schema,
})

const setResidenceAction = {
  param: residence,
  result: residence,
  events: [
    beforeAndAfterEvent('person', 'setResidence', person)
  ]
}

