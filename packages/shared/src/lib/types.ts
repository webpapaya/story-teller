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

  readonly name: string;
  readonly _is: ((input: unknown) => boolean);
  readonly _decode: (input: I, context: Context) => Result<Error[], O>;
  readonly encode: (input: O) => A;
  readonly _toJSON: (() => any) | undefined;
  readonly _build: (() => Array<() => O>) | undefined;

  constructor (props: {
    name: string
    is: ((input: unknown) => boolean)
    decode: (input: I, context: Context) => Result<Error[], O>
    encode: (input: O) => A
    toJSON?: () => any
    build: () => Array<() => O>
  }) {
    this.name = props.name
    this._is = props.is
    this._decode = props.decode
    this.encode = props.encode
    this._toJSON = props.toJSON
    this._build = props.build
  }

  is (input: unknown): input is O {
    return this._is(input)
  }

  isCollection (input: unknown[]): input is O[] {
    return input.every((input) => this._is(input))
  }

  toJSON () {
    return this._toJSON ? this._toJSON() : { type: this.name }
  }

  decode (input: I, context?: Context) {
    return this._decode(input, context || { path: '$' })
  }

  build () {
    if (!this._build) { throw new Error('No build defined') }
    return this._build()
  }

  pipe (props: {
    name?: string
    decode: (input: O, context: Context) => Result<Error[], O>,
    build?: (() => Array<() => O>);
  }) {
    return new Codec<A, O, I>({
      name: props.name || this.name,
      is: (input) => this.is(input) && props.decode(input, { path: '$' }).isOk(),
      decode: (i, c) => {
        const result = this.decode(i, c)
        if (!result.isOk() || !this.is(i)) { return result }
        return props.decode(i, c)
      },
      encode: this.encode.bind(this),
      build: props.build || this.build.bind(this)
    })
  }
}

export type RecordSchema = Record<string, AnyCodec>
export class RecordCodec<Schema, A, O, I> extends Codec<A, O, I> {
  readonly schema: Schema

  constructor (props: {
    name: string
    is: ((input: unknown) => boolean)
    decode: (input: I, context: Context) => Result<Error[], O>
    encode: (input: O) => A
    toJSON?: () => any
    schema: Schema
    build: () => Array<() => O>
  }) {
    super(props)
    this.schema = props.schema
  }
}

export class Validation<T> extends Codec<T, T, unknown> {
  constructor (props: {
    name: string
    decode: (input: unknown, context: Context) => Result<Error[], T>
    toJSON?: () => any
    build: () => Array<() => T>
  }) {
    super({
      ...props,
      encode: (input) => input,
      is: (input) => props.decode(input as T, { path: '$' }).isOk()
    })
  }
}

export const getContextPath = (name: string | number, parent?: string) => {
  const t = typeof name === 'number'
    ? `[${name}]`
    : `.${name}`

  return parent ? `${parent}${t}` : `${name}`
}
