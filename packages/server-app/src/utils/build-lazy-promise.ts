export const buildLazyPromise = () => {
  let resolve: () => void
  const promise = new Promise((_resolve) => { resolve = _resolve }) // eslint-disable-line promise/param-names
  return { resolve: resolve!, promise }
}