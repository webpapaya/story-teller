import {
  Validation,
  Ok,
  Err,
  Error,
  AnyCodec,
  getContextPath,
} from './types'

type RecordValidator = Record<string, AnyCodec>
const objectKeys = <O extends object>(value: O): Array<keyof O> =>
  Object.keys(value) as Array<keyof O>

export const record = <T extends RecordValidator>(validator: T) => {
  type Out = { [k in keyof T]: typeof validator[k]['T'] }

  return new Validation<{ [k in keyof T]: typeof validator[k]['T'] }>(
    'string',
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
    }
  )
}

export const array = <T extends AnyCodec>(schema: T) => {
  return new Validation<Array<typeof schema['T']>>(
    'array',
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
    }
  )
}

export const option = <T extends AnyCodec>(validator: T) => {
  return new Validation<typeof validator['T'] | undefined>(
    'option',
    (input, context) => input === undefined
      ? Ok(input)
      : validator.decode(input, context)
  )
}

type Literal = string | number | boolean | null | undefined
export const literal = <Value extends Literal>(value: Value) => new Validation<Value>(
  'literal',
  (input, context) => input === value
    ? Ok(input as Value)
    : Err([{ message: `must be literal ${value}`, context }])
)

export const union = <Validator extends AnyCodec>(validators: Validator[]) => {
  return new Validation<typeof validators[number]['T']>(
    'union',
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
    }
  )
}

export const literalUnion = <Literals extends Literal>(literals: Literals[]) => {
  const validator = union(literals.map((value) => literal(value)))
  return new Validation<typeof validator['T']>(
    'literalUnion',
    (input, context) => {
      const result = validator.decode(input, context)
      return result.isOk()
        ? result
        : Err([{ message: `must be one of (${literals.join(', ')})`, context }])
    }
  )
}

export const nullCodec = literal(null)
export const undefinedCodec = literal(undefined)
export const number = new Validation<number>(
  'number',
  (input, context) => {
    return typeof input == 'number' && !isNaN(input)
      ? Ok(input)
      : Err([{ message: `is not a number`, context }])
  }
)

export const string = new Validation<string>(
  'string',
  (input, context) => (
    typeof input === 'string'
      ? Ok(input)
      : Err([{ message: 'must be a string', context }])),
)

export const boolean = new Validation<boolean>(
  'boolean',
  (input, context) => (
    typeof input === 'boolean'
      ? Ok(input)
      : Err([{ message: 'must be a boolean', context }])),
)