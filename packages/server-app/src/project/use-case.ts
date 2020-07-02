import { AnyCodec } from '@story-teller/shared'

class ReaderMonad<A, B> {
  constructor (public runReader: (a: A) => B, private precondition: ((a: A) => boolean) = () => true) {
  }

  preCondition (func: (a: A) => boolean): ReaderMonad<A, B> {
    return new ReaderMonad<A, B>((a) => this.runReader(a), func)
  }

  map<C> (func: (b: B) => C): ReaderMonad<A, C> {
    return new ReaderMonad<A, C>((a: A) => {
      if (!this.precondition(a)) { throw new Error('precondition not met') }
      const b = this.runReader(a)
      return func(b)
    })
  }
}

class ReaderWithArg<A, B, Arg> {
  constructor (public runReader: (a: A, arg: Arg) => B, private precondition: ((a: A, arg: Arg) => boolean) = () => true) {
  }

  preCondition (func: (a: A, arg: Arg) => boolean): ReaderWithArg<A, B, Arg> {
    return new ReaderWithArg<A, B, Arg>((a, arg) => this.runReader(a, arg), func)
  }

  map<C> (func: (b: B, arg: Arg) => C): ReaderWithArg<A, C, Arg> {
    return new ReaderWithArg<A, C, Arg>((a: A, arg: Arg) => {
      if (!this.precondition(a, arg)) { throw new Error('precondition not met') }
      const b = this.runReader(a, arg)
      return func(b, arg)
    })
  }
}

export const useCaseFromCodec = <Codec extends AnyCodec>(codec: Codec) => {
  return new ReaderMonad((value: Codec['O']) => {
    if (codec.is(value)) {
      return value
    }
    throw new Error('Invalid Domain object')
  })
}

export const useCaseWithArgFromCodec = <EntityCodec extends AnyCodec, ArgCodec extends AnyCodec>(codec: EntityCodec, arcCodec: ArgCodec) => {
  return new ReaderWithArg((value: EntityCodec['O'], arg: ArgCodec['O']) => {
    if (codec.is(value)) {
      return value
    }
    throw new Error('Invalid Domain object')
  })
}
