/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Result } from 'space-lift'

export { Ok, Err, Result } from 'space-lift'
export type Context = { path: string }
export type Error = { message: string, context: Context }
export type AnyCodec = Codec<any, any, any>
export class Codec<A, O, I> {
  // Phantom types
  readonly A: A = null as any as A
  readonly O: O = null as any as O
  readonly I: I = null as any as I

  constructor (
    readonly name: string,
    readonly _is: ((input: unknown) => boolean),
    readonly _decode: (input: I, context: Context) => Result<Error[], O>,
    readonly encode: (input: O) => A,
    readonly _toJSON?: () => any
  ) {}

  is(input: unknown): input is O {
    return this._is(input)
  }

  isCollection(input: unknown[]): input is O[] {
    return input.every((input) => this._is(input))
  }

  toJSON () {
    return this._toJSON ? this._toJSON() : { type: this.name }
  }

  decode (input: I, context?: Context) {
    return this._decode(input, context || { path: '$' })
  }
  pipe<B, IB, A extends IB, OB extends A> (
    this: Codec<A, O, I>,
    ab: Codec<B, OB, IB>,
    name: string = `${ab.name} > ${this.name}`
  ) {
    return new Codec<B, O, I>(
      name,
      (input) => this.is(input) && ab.is(input),
      (i, c) => {
        const result = this.decode(i, c)
        if (!result.isOk()) { return result }
        // @ts-ignore
        return ab.decode(i)
      },
      // @ts-ignore
      b => ab.encode(this.encode(b))
    )
  }
}

export class Validation<T> extends Codec<T, T, unknown> {
  constructor (
    name: string,
    decode: (input: unknown, context: Context) => Result<Error[], T>,
    toJSON?: () => any
  ) {
    super(
      name,
      (input) => decode(input as T, { path: '$' }).isOk(),
      decode,
      (input) => input,
      toJSON
    )
  }
}

export const getContextPath = (name: string | number, parent?: string) => {
  const t = typeof name === 'number'
    ? `[${name}]`
    : `.${name}`

  return parent ? `${parent}${t}` : `${name}`
}
