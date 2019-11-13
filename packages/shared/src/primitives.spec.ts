// @ts-ignore
import {assertThat, equalTo, hasProperty} from 'hamjest'
import { Result, Ok, Err } from 'space-lift'

type Context = { path: string }
type Error = { message: string, context: Context }

class Validation<A, O, I> {
  readonly T: O = null as any as O // Phantom type
  constructor(
    readonly name: string,
    readonly is: (input: unknown) => boolean,
    readonly _decode: (input: I, context: Context) => Result<Error[], O>,
    readonly encode: (input: O) => A,
  ) {}

  decode(input: I, context?: Context) {
    return this._decode(input, context || { path: '$' })
  }
}

const nonEmptyString = new Validation<string, string, unknown>(
  'nonEmptyString',
  (input): input is string => typeof input === 'string' && input.length > 0,
  (input, context) => (
    typeof input === 'string' && input.length > 0
      ? Ok(input)
      : Err([{ message: 'can\'t be empty', context }])),
  (input) => input
)

const string = new Validation<string, string, unknown>(
  'string',
  (input): input is string => typeof input === 'string',
  (input, context) => (
    typeof input === 'string'
      ? Ok(input)
      : Err([{ message: 'must be a string', context }])),
  (input) => input
)

const objectKeys = <O extends object>(value: O): (keyof O)[] =>
  Object.keys(value) as (keyof O)[]

export type RecordValidator = Record<string, Validation<any, any, any>>
const record = <T extends RecordValidator>(validator: T) => {
  type Out = { [k in keyof T]: typeof validator[k]['T'] }

  const validate = (input: unknown, context: Context): Result<Error[], Out> => {
    if (typeof input !== 'object' || input === null) {
      return Err([{
        message: 'must be an object',
        context
      }])
    }

    const errors: Error[] = []
    const keys = objectKeys(validator)
    const result: Partial<Out> = keys.reduce((result, key) => {
      const validationResult = validator[key]
        // @ts-ignore
        .decode(input[key], { ...context, path: `${context.path}.${key}`})

      if (validationResult.isOk()) {
        result[key] = validationResult.get()
      } else {
        errors.push(...validationResult.get())
      }
      return result
    }, {} as Partial<Out>);

    if (errors.length === 0) {
      return Ok(result as Out)
    } else {
      return Err(errors)
    }
  }

  return new Validation<
    { [k in keyof T]: typeof validator[k]['T'] },
    { [k in keyof T]: typeof validator[k]['T'] },
    unknown
  >(
    'string',
    (input) => validate(input, { path: 'irrelevant' }).isOk(),
    validate,
    (input) => input
  )
}

describe('nonEmptyString', () => {
  [
    { value: 'test', valid: true },
    { value: '2c2182c4-5d7e-4749-99e9-c4127a2e8358', valid: true },
    { value: null, valid: false },
  ].forEach(({value, valid}) => {
    it(`value ${value} ${valid ? 'is valid' : 'is invalid'}`, () => {
      assertThat(nonEmptyString.decode(value).isOk(), equalTo(valid))
    })
  });
})

describe('record', () => {
  describe('simple validator', () => {
    const validator = record({
      prop: nonEmptyString
    })

    it('responds correct object for valid record', () => {
      assertThat(validator.decode({
        prop: 'not empty'
      }).get(), equalTo({ prop: 'not empty' }))
    })

    it('removes to additional properties', () => {
      assertThat(validator.decode({
        prop: 'not empty',
        additionalProp: 'test'
      }).get(), equalTo({ prop: 'not empty' }))
    })

    it('responds error', () => {
      assertThat(validator.decode({
        prop: '',
      }).isOk(), equalTo(false))
    })
  })

  it('works with nested records as well' , () => {
    const validator = record({
      prop: nonEmptyString,
      nested: record({
        prop: nonEmptyString
      })
    })

    const value = {
      prop: 'not empty',
      nested: {
        prop: 'hallo'
      }
    }

    assertThat(validator.decode(value).get(),
      equalTo(value))
  })
});







// const match = (regex: RegExp, value: unknown): value is string =>
//   typeof value === 'string' && regex.test(value)

// const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// const uuid = new t.Type<string, string, unknown>(
//   'uuid',
//   (input: unknown): input is string => match(UUID_REGEX, input),
//   (input, context) => (
//     match(UUID_REGEX, input)
//       ? t.success(input)
//       : t.failure(input, context, 'is not a valid UUID')),
//   t.identity
// )

// // const nonEmptyString = new t.Type<string, string, unknown>(
// //   'nonEmptyString',
// //   (input: unknown): input is string => typeof input === 'string' && input.length > 0,
// //   (input, context) => (
// //     typeof input === 'string' && input.length > 0
// //       ? t.success(input)
// //       : t.failure(input, context, 'can\'t be empty')),
// //   t.identity
// // )

// const localDate = new t.Type<LocalDate, string, unknown>(
//   'localDate',
//   (input: unknown): input is LocalDate => input instanceof LocalDate,
//   (input, context) => {
//     try {
//       return t.success(LocalDate.parse(input as unknown as string))
//     } catch (e) {
//       return t.failure(input, context, 'is not a valid ISO date')
//     }
//   },
//   (value) => value.toString()
// )

// const zonedDateTime = new t.Type<ZonedDateTime, string, unknown>(
//   'zonedDateTime',
//   (input: unknown): input is ZonedDateTime => input instanceof ZonedDateTime,
//   (input, context) => {
//     try {
//       return t.success(ZonedDateTime.parse(input as unknown as string))
//     } catch (e) {
//       return t.failure(input, context, 'is not a valid ISO date')
//     }
//   },
//   (value) => value.toString()
// )

// const HEX_REGEX = /^#(?:[0-9a-f]{3}){1,2}$/i
// const hexColor = new t.Type<string, string, unknown>(
//   'nonEmptyString',
//   (input: unknown): input is string => match(HEX_REGEX, input),
//   (input, context) => match(HEX_REGEX, input)
//     ? t.success(input.toUpperCase() as unknown as string)
//     : t.failure(input, context, 'is not a valid HEX color'),
//   t.identity
// )

// describe('uuid', () => {
//   [
//     { value: '2c2182c4-5d7e-4749-99e9-c4127a2e8358', valid: true },

//     { value: 'test', valid: false },
//     { value: null, valid: false },
//   ].forEach(({value, valid}) => {
//     it(`value ${value} ${valid ? 'is valid' : 'is invalid'}`, () => {
//       assertThat(isRight(uuid.decode(value)),
//         equalTo(valid))
//     })
//   })
// })


// describe('localDate', () => {
//   [
//     { value: '2000-01-01', valid: true },
//     { value: '0001-01-01', valid: true },

//     { value: 'not valid', valid: false },
//   ].forEach(({value, valid}) => {
//     it(`value ${value} ${valid ? 'is valid' : 'is invalid'}`, () => {
//       assertThat(isRight(localDate.decode(value)),
//         equalTo(valid))
//     })
//   });

//   [
//     { value: LocalDate.parse('2000-01-01'), valid: true },
//     { value: new Date(), valid: false },
//     { value: '2000-01-01', valid: false },
//   ].forEach(({value, valid}) => {
//     it(`value ${value} ${valid ? 'is from type localDate' : 'not from type localDate'}`, () => {
//       assertThat(localDate.is(value), equalTo(valid))
//     })
//   })
// })

// describe('zonedDateTime', () => {
//   [
//     { value: '2000-01-01T00:00:00+00:00', valid: true },
//     { value: 'not valid', valid: false },
//   ].forEach(({value, valid}) => {
//     it(`value ${value} ${valid ? 'is valid' : 'is invalid'}`, () => {
//       assertThat(isRight(zonedDateTime.decode(value)),
//         equalTo(valid))
//     })
//   });

//   [
//     { value: ZonedDateTime.parse('2000-01-01T00:00:00+00:00'), valid: true },
//     { value: new Date(), valid: false },
//     { value: '2000-01-01', valid: false },
//   ].forEach(({value, valid}) => {
//     it(`value ${value} ${valid ? 'is from type localDate' : 'not from type localDate'}`, () => {
//       assertThat(zonedDateTime.is(value), equalTo(valid))
//     })
//   })
// })

// describe('hexColor', () => {
//   [
//     { value: '#ffffff', valid: true },
//     { value: '#fff', valid: true },
//     { value: '#zzzzzz', valid: false },
//   ].forEach(({value, valid}) => {
//     it(`value ${value} ${valid ? 'is valid' : 'is invalid'}`, () => {
//       assertThat(isRight(hexColor.decode(value)),
//         equalTo(valid))
//     })
//   })
// })

// it('type strips away additional props', () => {
//   const schema = t.exact(t.type({
//     prop: t.string
//   }))

//   assertThat(schema.decode({ prop: 'hallo', additionalProp: 'hallo'}),
//     hasProperty('right', equalTo({ prop: 'hallo'})));
// })