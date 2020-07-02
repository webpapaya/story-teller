export function uniqueBy<Type, Key extends keyof Type> (key: Key, array: Type[]): Type[] {
  return Object.values(array.reduce((result, obj) => {
    // @ts-ignore
    result[obj[key]] = obj
    return result
  }, {}))
}

export const unique = <Type>(array: Type[]): Type[] =>
  [...new Set(array)]
