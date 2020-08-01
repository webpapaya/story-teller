// // const x = validator.factory.pipe(
// //   withTrait('traitName'),
// //   withTrait('traitName', 'argument'),
// //   withLazyTrait('traitName', () => ['argument']),
// //   setInPath([''], '...'),
// //   modify(() => {}),
// // )

// interface Functor<T> {
//   map<U>(f: (x: T) => U): Functor<U>
// }

// class Box<T> implements Functor<T> {
//   value: T
//   constructor(x: T) {
//     this.value = x
//   }

//   map<U>(f: (x: T) => U): Box<U> {
//     return new Box(f(this.value))
//   }

//   toString(): string {
//     return `Box(${this.value})`
//   }
// }

// const multipliedBy = (multiplier: number) => (value: number) => value * multiplier

// import { assertThat, equalTo } from "hamjest"

// describe('factory', () => {
//   it('returns factory', async () => {
//     const myFactory = new Box(1)
//     assertThat(myFactory, equalTo(1))
//   })

//   it('returns with trait', async () => {
//     const myFactory = new Box(1)
//       .map(multipliedBy(2))

//     assertThat(myFactory, equalTo(2))
//   })

//   it('returns with trait and argument', async () => {
//     const myFactory = buildFactory(1, {
//       traitA: (value, multiplier: number) => value * multiplier
//     })
//       .useTraitWithArg('traitA', 3)

//     assertThat(myFactory.build(), equalTo(6))
//   })
// })
