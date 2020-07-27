import { Reaction, ReactionNode } from "./index";

export const reactionsToTree = (
  arr: Reaction[],
  fromProp = 'useCaseFrom',
  toProp = 'useCaseTo'
): ReactionNode<string>[] => {
  var tree = [],
      mappedArr = {},
      arrElem,
      mappedElem;

  // First map the nodes of the array to an object -> create a hash table.
  for(var i = 0, len = arr.length; i < len; i++) {
    arrElem = arr[i];
    // @ts-ignore
    mappedArr[arrElem[fromProp]] = arrElem;
    // @ts-ignore
    mappedArr[arrElem[fromProp]].sideEffects = [];
  }


  for (var id in mappedArr) {
    if (mappedArr.hasOwnProperty(id)) {
      // @ts-ignore
      mappedElem = mappedArr[id];
      // If the element is not at the root level, add it to its parent array of children.
      if (mappedElem[toProp]) {
        // @ts-ignore
        mappedArr[mappedElem[toProp]]['sideEffects'].push(mappedElem);
      }
      // If the element is at the root level, add it to first level elements array.
      else {
        tree.push(mappedElem);
      }
    }
  }
  return tree;
}