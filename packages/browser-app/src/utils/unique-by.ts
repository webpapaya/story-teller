export function uniqueBy<Type, Key extends keyof Type> (keys: Key[], array: Type[]): Type[] {
  return Object.values(array.reduce((result, obj) => {
    const values = keys.map((key) => obj[key]).join(' / ')
    // @ts-ignore
    result[values] = obj
    return result
  }, {}))
}
