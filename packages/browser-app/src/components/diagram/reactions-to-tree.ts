import { Reaction, ReactionNode } from './index'

export const reactionsToTree = (
  arr: Reaction[],
  fromProp = 'useCaseFrom',
  toProp = 'useCaseTo'
): Array<ReactionNode<string>> => {
  var tree = []
  var mappedArr = {}
  var arrElem
  var mappedElem

  for (var i = 0, len = arr.length; i < len; i++) {
    arrElem = arr[i]
    // @ts-ignore
    mappedArr[arrElem[fromProp]] = arrElem
    // @ts-ignore
    mappedArr[arrElem[fromProp]].sideEffects = []
  }

  for (var id in mappedArr) {
    if (Object.prototype.hasOwnProperty.call(mappedArr, id)) {
      // @ts-ignore
      mappedElem = mappedArr[id]
      if (mappedElem[toProp]) {
        // @ts-ignore
        mappedArr[mappedElem[toProp]].sideEffects.push(mappedElem)
      } else {
        tree.push(mappedElem)
      }
    }
  }
  return tree
}
