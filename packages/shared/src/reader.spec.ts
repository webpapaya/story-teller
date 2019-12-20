/* eslint-disable */
class ReaderMonad<A, B> {
  constructor (public runReader: (a: A) => Promise<B>) {
  }

  bind<C> (func: (b: B) => ReaderMonad<A, C> | C): ReaderMonad<A, C> {
    return new ReaderMonad<A, C>((a: A) => {
      return this.runReader(a)
        .then((b) => {
          const rtn = func(b)
          if (rtn instanceof ReaderMonad) {
            return rtn.runReader(a)
          }
          return ReaderMonad.return(rtn).runReader(a)
        })
    })
  }

  static return<A, B> (b: B): ReaderMonad<A, B> {
    return new ReaderMonad((a: A) => Promise.resolve(b))
  }
}
