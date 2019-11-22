import { Result } from 'space-lift'

export { Ok, Err } from 'space-lift'
export type Context = { path: string }
export type Error = { message: string, context: Context }
export type AnyCodec = Codec<any, any, any>
export class Codec<A, O, I> {
  readonly T: O = null as any as O // Phantom type
  constructor (
    readonly name: string,
    readonly is: ((input: unknown) => boolean),
    readonly _decode: (input: I, context: Context) => Result<Error[], O>,
    readonly encode: (input: O) => A
  ) {}

  decode (input: I, context?: Context) {
    return this._decode(input, context || { path: '$' })
  }
}

export class Validation<T> extends Codec<T, T, unknown> {
  constructor (
    name: string,
    decode: (input: unknown, context: Context) => Result<Error[], T>,
  ) {
    super(
      name,
      (input) => decode(input as unknown as T, { path: '$' }).isOk(),
      decode,
      (input) => input
    )
  }
}

export const getContextPath = (name: string | number, parent?: string) => {
  const t = typeof name === 'number'
    ? `[${name}]`
    : `.${name}`

  return parent ? `${parent}${t}` : `${name}`
}
