export const sequentially = (promiseFns: Array<() => Promise<unknown>>) => {
  return promiseFns.reduce<Promise<unknown>>((promises, currentPromise) => {
    return promises.then(() => currentPromise())
  }, Promise.resolve())
}
