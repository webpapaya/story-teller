export const randBetween = (lower: number, upper: number) =>
  Math.floor(Math.random() * (upper - lower)) + lower

export const cartesianProduct = <T>(...array: T[][]): T[][] => {
  let results = [[]]
  for (let i = 0; i < array.length; i++) {
    let currentSubArray: T[] = array[i]
    let temp: T[] = []
    for (let j = 0; j < results.length; j++) {
      for (let k = 0; k < currentSubArray.length; k++) {
        // @ts-ignore
        temp.push(results[j].concat(currentSubArray[k]))
      }
    }
    // @ts-ignore
    results = temp
  }
  return results
}

export const objectKeys = <O extends object>(value: O): Array<keyof O> =>
  Object.keys(value) as Array<keyof O>

export const isObject = (input: unknown): input is object =>
  typeof input === 'object' && input !== null
