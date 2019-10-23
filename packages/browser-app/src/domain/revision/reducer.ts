import { Actions, Revision } from './types'
const initialState: Revision[] = []

function uniqueBy<Type, Key extends keyof Type>(key: Key, array: Type[]): Type[] {
  return Object.values(array.reduce((result, obj) => {
    // @ts-ignore
    result[obj[key]] = obj
    return result
  }, {}));
}

const reducer = (state = initialState, action: Actions): Revision[] => {
  switch (action.type) {
    case "REVISION/FETCH/SUCCESS":
        return uniqueBy('id', [
          ...state,
          ...action.payload
        ])

    default: return state
  }
}

export default reducer
