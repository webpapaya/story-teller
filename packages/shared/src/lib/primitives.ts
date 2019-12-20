
import {
  Codec,
  Validation,
  Ok,
  Err,
  Error,
  AnyCodec,
  getContextPath
} from './types'

const objectKeys = <O extends object>(value: O): Array<keyof O> =>
  Object.keys(value) as Array<keyof O>

const isObject = (input: unknown): input is object =>
  typeof input === 'object' && input !== null

type RecordValidator = Record<string, AnyCodec>
const buildRecord = (kind: string) => <T extends RecordValidator>(validator: T) => {
  type A = { [k in keyof T]: typeof validator[k]['A'] }
  type O = { [k in keyof T]: typeof validator[k]['O'] }

  return new Codec<
  { [k in keyof T]: typeof validator[k]['A'] },
  { [k in keyof T]: typeof validator[k]['O'] },
  unknown
  >(
    kind,
    (input) => {
      return isObject(input) && objectKeys(validator).every((key) => {
        // @ts-ignore
        const value = input[key]
        return key in input && validator[key].is(value)
      })
    },
    (input, context) => {
      if (!isObject(input)) { return Err([{ message: 'must be an object', context }]) }

      const result: Partial<O> = {}
      const errors: Error[] = []

      for (let key of objectKeys(validator)) {
        // @ts-ignore
        const value = input[key]
        const propertyContext = { ...context, path: getContextPath(key as string, context.path) }
        const validationResult = validator[key].decode(value, propertyContext)

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
    (value) => {
      const result: Partial<A> = {}
      for (let key of objectKeys(validator)) {
        result[key] = validator[key].encode(value[key])
      }
      return result as A
    },
    () => ({
      type: 'object',
      required: Object.keys(validator).filter((prop) => prop !== 'undefined'),
      properties: validator
    })
  )
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
  >(
    'array',
    (value) => Array.isArray(value) && value.every((item) => schema.is(item)),
    (input, context) => {
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
    (input) => input.map((value) => schema.encode(value)),
    () => ({ type: 'array', items: schema })
  )
}

export const union = <Validator extends AnyCodec>(validators: Validator[]) => {
  return new Codec<
    typeof validators[number]['A'],
    typeof validators[number]['O'],
  unknown
  >(
    'union',
    (input) => validators.some((validator) => validator.is(input)),
    (input, context) => {
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
    (input) => {
      return validators
        .find((validator) => validator.is(input))!
        .encode(input)
    },
    () => ({ 'oneOf': validators })
  )
}

type Literal = string | number | boolean | null | undefined
export const literal = <Value extends Literal>(value: Value) => new Validation<Value>(
  'literal',
  (input, context) => input === value
    ? Ok(input as Value)
    : Err([{ message: `must be literal ${value}`, context }]),
  () => {
    if (typeof value === 'undefined') {
      return ({ const: `undefined` })
    } else if (value === null) {
      return ({ const: 'null' })
    } else {
      return ({ const: value })
    }
  }
)

export const literalUnion = <Literals extends Literal>(literals: Literals[]) =>
  union(literals.map((value) => literal(value)))

export const nullCodec = literal(null)
export const undefinedCodec = literal(undefined)

export const option = <T extends AnyCodec>(validator: T) =>
  union([validator, undefinedCodec])

export const nullable = <T extends AnyCodec>(validator: T) =>
  union([validator, nullCodec])

export const number = new Validation<number>(
  'number',
  (input, context) => {
    return typeof input === 'number' && !Number.isNaN(input)
      ? Ok(input)
      : Err([{ message: `is not a number`, context }])
  }
)

export const string = new Validation<string>(
  'string',
  (input, context) => (
    typeof input === 'string'
      ? Ok(input)
      : Err([{ message: 'must be a string', context }]))
)

export const boolean = new Validation<boolean>(
  'boolean',
  (input, context) => (
    typeof input === 'boolean'
      ? Ok(input)
      : Err([{ message: 'must be a boolean', context }]))
)

export const matchesRegex = (name: string, regex: RegExp) => new Validation<string>(
  name,
  (input, context) => {
    return typeof input === 'string' && regex.test(input)
      ? Ok(input)
      : Err([{ message: `must be a valid ${name}`, context }])
  }
)
