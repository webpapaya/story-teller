export const sequentially = (promiseFns: Array<() => Promise<unknown>>) => {
  return promiseFns.reduce((promises, currentPromise) => {
    return promises.then(() => currentPromise())
  }, Promise.resolve() as Promise<unknown>);
}
