// @ts-ignore
import { assertThat, equalTo, hasProperty } from 'hamjest'
import { Result, Ok, Err } from 'space-lift'

type Context = { path: string }
type Error = { message: string, context: Context }

class Validation<A, O, I> {
  readonly T: O = null as any as O // Phantom type
  constructor (
    readonly name: string,
    readonly is: (input: unknown) => boolean,
    readonly _decode: (input: I, context: Context) => Result<Error[], O>,
    readonly encode: (input: O) => A
  ) {}

  decode (input: I, context?: Context) {
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

const getContextPath = (name: string | number, parent?: string) => {
  const t = typeof name === 'number'
    ? `[${name}]`
    : `.${name}`

  return parent ? `${parent}${t}` : `${name}`
}

const objectKeys = <O extends object>(value: O): Array<keyof O> =>
  Object.keys(value) as Array<keyof O>

type AnyValidator = Validation<any, any, any>
type RecordValidator = Record<string, AnyValidator>

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
        .decode(input[key], { ...context, path: getContextPath(key, context.path) })

      if (validationResult.isOk()) {
        result[key] = validationResult.get()
      } else {
        errors.push(...validationResult.get())
      }
      return result
    }, {} as Partial<Out>)

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
    (input) => validate(input, { path: '$' }).isOk(),
    validate,
    (input) => input
  )
}

const array = <T extends AnyValidator>(schema: T) => {
  return new Validation<
  Array<typeof schema['T']>,
  Array<typeof schema['T']>,
  unknown
  >(
    'array',
    (input) => true,
    (input, context) => {
      if (!Array.isArray(input)) {
        return Err([{ message: 'is not an array', context }])
      }
      const errors: Error[] = []
      const result: Array<typeof schema['T']> = []

      input.forEach((value, index) => {
        const itemContext = { path: getContextPath(index, context.path) }
        const validationResult = schema.decode(value, itemContext)
        if (validationResult.isOk()) {
          result.push(validationResult.get())
        } else {
          errors.push(...validationResult.get())
        }
      })

      if (errors.length === 0) {
        return Ok(result)
      } else {
        return Err(errors)
      }
    },
    (input) => input
  )
}

describe('nonEmptyString', () => {
  [
    { value: 'test', valid: true },
    { value: '2c2182c4-5d7e-4749-99e9-c4127a2e8358', valid: true },
    { value: null, valid: false }
  ].forEach(({ value, valid }) => {
    it(`value ${value} ${valid ? 'is valid' : 'is invalid'}`, () => {
      assertThat(nonEmptyString.decode(value).isOk(), equalTo(valid))
    })
  })
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
        prop: ''
      }).get(), hasProperty('0', hasProperty('context', hasProperty('path', '$.prop'))))
    })
  })

  it('works with nested records as well', () => {
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
})

describe('array', () => {
  const validator = array(nonEmptyString)

  it('responds correct array when valid', () => {
    assertThat(validator.decode(['empty']).get(),
      equalTo(['empty']))
  })

  it('responds errors when invalid', () => {
    assertThat(validator.decode(['']).get(),
      hasProperty('0', hasProperty('context', hasProperty('path', '$[0]'))))
  })
})
