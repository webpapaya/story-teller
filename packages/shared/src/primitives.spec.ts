// @ts-ignore
import { assertThat, equalTo, hasProperty } from 'hamjest'
import { Result, Ok, Err } from 'space-lift'

type Context = { path: string }
type Error = { message: string, context: Context }

class Validation<A, O, I> {
  readonly T: O = null as any as O // Phantom type
  constructor (
    readonly name: string,
    readonly _is: ((input: unknown) => boolean) | null,
    readonly _decode: (input: I, context: Context) => Result<Error[], O>,
    readonly encode: (input: O) => A
  ) {}

  decode (input: I, context?: Context) {
    return this._decode(input, context || { path: '$' })
  }

  is (input: unknown): boolean {
    if (this._is) { return this._is(input) }
    return this.decode(input as unknown as I).isOk()
  }
}

type NonEmptyString = string
const nonEmptyString = new Validation<NonEmptyString, NonEmptyString, unknown>(
  'nonEmptyString',
  null,
  (input, context) => (
    typeof input === 'string' && input.length > 0
      ? Ok(input)
      : Err([{ message: 'can\'t be empty', context }])),
  (input) => input
)

const string = new Validation<string, string, unknown>(
  'string',
  null,
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

  return new Validation<
    { [k in keyof T]: typeof validator[k]['T'] },
    { [k in keyof T]: typeof validator[k]['T'] },
    unknown
  >(
    'string',
    null,
    (input, context) => {
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
    },
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
    null,
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

const option = <T extends AnyValidator>(validator: T) => {
  return new Validation<
    typeof validator['T'] | undefined,
    typeof validator['T'] | undefined,
    unknown
  >(
    'option',
    (input) => input === undefined || validator.is(input),
    (input, context) => input === undefined
      ? Ok(input)
      : validator.decode(input, context),
    (input) => input
  )
}

type Literal = string | number | boolean | null | undefined
const literal = <Value extends Literal>(value: Value) => new Validation<
  Value,
  Value,
  unknown
>(
  'literal',
  null,
  (input, context) => input === value
    ? Ok(input as Value)
    : Err([{ message: `must be literal ${value}`, context }]),
  (input) => input
)

const union = <Validator extends AnyValidator>(validators: Validator[]) => new Validation<
  typeof validators[number]['T'],
  typeof validators[number]['T'],
  unknown
>(
  'union',
  null,
  (input, context) => {
    const errors: string[] = []
    for (const validator of validators) {
      const result = validator.decode(input, context)
      if (result.isOk()) {
        return Ok(input)
      } else {
        errors.push(...result.get().map((error) => error.message))
      }
    }
    return Err([{
      message: `union must comply with one of the validators (${errors.join(',')})`,
      context
    }])
  },
  (input) => input
)

const literalUnion = <Literals extends Literal>(literals: Literals[]) => {
  const validator = union(literals.map((value) => literal(value)))
  return new Validation<
    typeof validator['T'],
    typeof validator['T'],
    unknown
  >(
    'literalUnion',
    (input) => validator.is(input),
    (input, context) => {
      const result = validator.decode(input, context)
      return result.isOk()
        ? result
        : Err([{ message: `must be one of (${literals.join(', ')})`, context }])
    },
    (input) => validator.encode(input)
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

describe('option', () => {
  const validator = option(string)

  it('responds correct string', () => {
    assertThat(validator.decode('a string').get(),
      equalTo('a string'))
  })

  it('responds undefined', () => {
    assertThat(validator.decode(undefined).get(),
      equalTo(undefined))
  })
})

describe('literal', () => {
  it('responds literal when same', () => {
    assertThat(literal('x').decode('x').get(),
      equalTo('x'))
  })

  it('responds error when literal differs', () => {
    assertThat(literal('y').decode('x').isOk(),
      equalTo(false))
  })
})


describe('union', () => {
  describe('works with literals', () => {
    const validator = union([literal('a'), literal('b')])
    it('responds literal when same', () => {
      assertThat(validator.decode('a').get(),
        equalTo('a'))
    })

    it('responds error when literal differs', () => {
      assertThat(validator.decode('c').isOk(),
        equalTo(false))
    })
  })

  describe('AND other validators', () => {
    const validator = union([nonEmptyString, literal(1)])

    it('responds error for empty string', () => {
      assertThat(validator.decode('').isOk(),
        equalTo(false))
    })

    it('responds success for number 1', () => {
      assertThat(validator.decode(1).isOk(),
        equalTo(true))
    })
  })
})

describe('literalUnion', () => {
  const validator = literalUnion([1, 2, 'test'])

  it('responds literal when same', () => {
    assertThat(validator.decode(1).get(),
      equalTo(1))
  })

  it('responds error when literal differs', () => {
    assertThat(validator.decode('').isOk(),
      equalTo(false))
  })
})
