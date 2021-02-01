
import {
  Codec,
  Validation,
  Ok,
  Err,
  Error,
  AnyCodec,
  getContextPath,
  RecordCodec,
  RecordSchema
} from './types'
import RandExp from 'randexp'
import { randBetween, cartesianProduct, objectKeys, isObject } from './utils'

const buildRecord = (name: string) => <T extends RecordSchema>(schema: T) => {
  type A = { [k in keyof T]: typeof schema[k]['A'] }
  type O = { [k in keyof T]: typeof schema[k]['O'] }

  return new RecordCodec<
    typeof schema,
  { [k in keyof T]: typeof schema[k]['A'] },
  { [k in keyof T]: typeof schema[k]['O'] },
  unknown
  >({
    name,
    schema,
    is: (input) => {
      return isObject(input) && objectKeys(schema).every((key) => {
        // @ts-ignore
        const value = input[key]
        return key in input && schema[key].is(value)
      })
    },
    decode: (input, context) => {
      if (!isObject(input)) { return Err([{ message: 'must be an object', context }]) }

      const result: Partial<O> = {}
      const errors: Error[] = []

      for (const key of objectKeys(schema)) {
        // @ts-ignore
        const value = input[key]
        const propertyContext = { ...context, path: getContextPath(key as string, context.path) }
        const validationResult = schema[key].decode(value, propertyContext)

        if (validationResult.isOk()) {
          result[key] = validationResult.get()
        } else {
          errors.push(...validationResult.get())
        }
      }

      return errors.length === 0
        ? Ok(result as O)
        : Err(errors)
    },
    encode: (value) => {
      const result: Partial<A> = {}
      for (const key of objectKeys(schema)) {
        result[key] = schema[key].encode(value[key])
      }
      return result as A
    },
    toJSON: () => ({
      type: 'object',
      required: Object.keys(schema).filter((prop) => prop !== 'undefined'),
      properties: schema
    }),
    build: () => {
      const result: any = []
      const keys = objectKeys(schema)
      const permutations = cartesianProduct(...keys.map((key) => schema[key].build()))

      permutations.forEach((permutation) => {
        result.push(() => {
          const record: Partial<() => O> = {}
          keys.forEach((key, i) => {
            // @ts-ignore
            record[key] = permutation[i]()
          })
          return record as O
        })
      })
      return result
    }
  })
}

export const record = buildRecord('record')
export const valueObject = buildRecord('valueObject')
export const entity = buildRecord('entity')
export const aggregate = buildRecord('aggregate')

export const array = <T extends AnyCodec>(schema: T) => {
  return new Codec<
  Array<typeof schema['A']>,
  Array<typeof schema['O']>,
  unknown
  >({
    name: 'array',
    is: (value) => Array.isArray(value) && value.every((item) => schema.is(item)),
    decode: (input, context) => {
      if (!Array.isArray(input)) {
        return Err([{ message: 'is not an array', context }])
      }
      const errors: Error[] = []
      const result: Array<typeof schema['O']> = []

      input.forEach((value, index) => {
        const itemContext = { path: getContextPath(index, context.path) }
        const validationResult = schema.decode(value, itemContext)
        if (validationResult.isOk()) {
          result.push(validationResult.get())
        } else {
          errors.push(...validationResult.get())
        }
      })

      return errors.length === 0
        ? Ok(result)
        : Err(errors)
    },
    encode: (input) => input.map((value) => schema.encode(value)),
    toJSON: () => ({ type: 'array', items: schema }),
    build: () => {
      const result: any = []
      const buildFns = schema.build()

      result.push(() => [])

      // every buildFn as single item array
      buildFns.forEach((buildFn) => {
        result.push(() => [buildFn()])
      })

      result.push(() => {
        const permutationResult = Array.from({ length: randBetween(1, 100) })
        permutationResult.forEach((_, i) => {
          const idx = randBetween(0, buildFns.length)
          // @ts-ignore
          permutationResult[i] = buildFns[idx]()
        })
        return permutationResult
      })

      return result
    }
  })
}

export const union = <Validator extends AnyCodec>(validators: Validator[]) => {
  return new Codec<
    typeof validators[number]['A'],
    typeof validators[number]['O'],
  unknown
  >({
    name: 'union',
    is: (input) => validators.some((validator) => validator.is(input)),
    decode: (input, context) => {
      const errors: string[] = []
      for (const validator of validators) {
        const result = validator.decode(input, context)
        if (result.isOk()) { return Ok(input) }
        errors.push(...result.get().map((error) => error.message))
      }
      return Err([{
        message: `union must comply with one of the validators (${errors.join(',')})`,
        context
      }])
    },
    encode: (input) => {
      return validators
        .find((validator) => validator.is(input))!
        .encode(input)
    },
    toJSON: () => ({ oneOf: validators }),
    build: () => {
      const result: Array<() => typeof validators[number]['O']> = []
      for (const validator of validators) {
        result.push(...validator.build())
      }
      return result
    }
  })
}

type Literal = string | number | boolean | null | undefined
export const literal = <Value extends Literal>(value: Value) => new Validation<Value>({
  name: 'literal',
  decode: (input, context) => input === value
    ? Ok(input as Value)
    : Err([{ message: `must be literal ${value}`, context }]),
  toJSON: () => {
    if (typeof value === 'undefined') {
      return ({ const: 'undefined' })
    } else if (value === null) {
      return ({ const: 'null' })
    } else {
      return ({ const: value })
    }
  },
  build: () => [() => value]
})

export const literalUnion = <Literals extends Literal>(literals: Literals[]) =>
  union(literals.map((value) => literal(value)))

export const nullCodec = literal(null)
export const undefinedCodec = literal(undefined)

export const option = <T extends AnyCodec>(validator: T) =>
  union([validator, undefinedCodec])

export const nullable = <T extends AnyCodec>(validator: T) =>
  union([validator, nullCodec])

export const number = new Validation<number>({
  name: 'number',
  decode: (input, context) => {
    return typeof input === 'number' && !Number.isNaN(input)
      ? Ok(input)
      : Err([{ message: 'is not a number', context }])
  },
  build: () => [
    () => randBetween(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER) + Math.random(),
    () => randBetween(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
  ]
})

export const integer = new Validation<number>({
  name: 'integer',
  decode: (input, context) => {
    return Number(input) === input && input % 1 === 0
      ? Ok(input)
      : Err([{ message: 'is not an integer', context }])
  },
  build: () => [
    () => randBetween(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
  ]
})

export const clampedInteger = (min: number, max: number) => integer.pipe({
  name: `clampedInteger(${min}, ${max})`,
  decode: (input, context) => {
    return input >= min && input <= max
      ? Ok(input)
      : Err([{ message: `needs to be between ${min} and ${max}`, context }])
  },
  build: () => [
    () => randBetween(min, max)
  ]
})

export const positiveInteger = clampedInteger(0, Number.MAX_SAFE_INTEGER)
export const negativeInteger = clampedInteger(Number.MIN_SAFE_INTEGER, 0)

export const string = new Validation<string>({
  name: 'string',
  decode: (input, context) => (
    typeof input === 'string'
      ? Ok(input)
      : Err([{ message: 'must be a string', context }])),
  build: () => [
    () => '',
    () => 'A simple string'
  ]
})

export const boolean = new Validation<boolean>({
  name: 'boolean',
  decode: (input, context) => (
    typeof input === 'boolean'
      ? Ok(input)
      : Err([{ message: 'must be a boolean', context }])),
  build: () => [
    () => true,
    () => false
  ]
})

export const matchesRegex = (name: string, regex: RegExp) => new Validation<string>({
  name: name,
  decode: (input, context) => {
    return typeof input === 'string' && regex.test(input)
      ? Ok(input)
      : Err([{ message: `must be a valid ${name}`, context }])
  },
  build: () => [
    () => new RandExp(regex).gen()
  ]
})
