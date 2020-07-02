const cartesian = <A, B>(a: A[], b: B[]) => ([] as Array<[A, B]>).concat(...a.map(a => b.map(b => ([] as any).concat(a, b))))
const parameters = Array.from({ length: 5 }).map((_, idx) => idx + 1)

const declarations = cartesian(parameters, parameters).map(([oldNesting, newNesting]) => {
  const oldKeys = Array.from({ length: oldNesting }).map((_, idx) => idx + 1)
  const newKeys = Array.from({ length: newNesting }).map((_, idx) => idx + 1)

  const newGenerics = newKeys.map((number) => `N${number} extends string`)
  const oldGenerics = oldKeys.slice(1).reduce((result, number) => {
    result.push(`${result[result.length - 1].replace(`O${number - 1}`, `O${number}`)}[O${number - 1}]`)
    return result
  }, ['O1 extends keyof S'])

  const oldPathArg = `[${oldKeys.map((number) => `O${number}`).join(', ')}]`
  const newPathArg = `[${newKeys.map((number) => `N${number}`).join(', ')}]`

  const valueType = `S${oldKeys.map((number) => `[O${number}]`).join('')}`
  const newMappingType = [...newKeys].slice(0, -1).reverse().reduce((result, number) => {
    return `{ [key in N${number}]: ${result} }`
  }, valueType)

  const oldMappingType = oldKeys.slice(1).map((number) => {
    const s = `Omit<S${oldKeys.slice(0, number - 1).map((number) => `[O${number}]`).join('')}, O${number}>`
    return oldKeys.slice(0, number - 1).reverse().reduce((result, number) => {
      return `{ [key in O${number}]: ${result} }`
    }, s)
  })

  const returnValue = [
    'Omit<S, O1>',
    ...oldMappingType,
    newMappingType
  ]

  return `
function renamePath${oldNesting}To${newNesting}<
  S,

  ${oldGenerics.join(',\n  ')},

  ${newGenerics.join(',\n  ')}
>(record: S, oldPath: ${oldPathArg}, newPath: ${newPathArg}):
  ${returnValue.join(' &\n  ')}
{
  return 1 as any
}
`
})

process.stdout.write(declarations.join(''))
