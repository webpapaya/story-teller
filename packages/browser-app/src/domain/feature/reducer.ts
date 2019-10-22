import { Feature, Actions } from './types'

const initialState: Feature[] = []

function uniqueBy<Type, Key extends keyof Type>(key: Key, array: Type[]): Type[] {
  return Object.values(array.reduce((result, obj) => {
    // @ts-ignore
    result[obj[key]] = obj
    return result
  }, {}));
}


const reducer = (state = initialState, action: Actions): Feature[] => {
  switch (action.type) {

    case "FEATURE_REVISION/FETCH/SUCCESS":
    case "FEATURE/FETCH/SUCCESS":
        return uniqueBy('id', [
          ...state,
          ...action.payload
        ])

    case "FEATURE/CREATE_REVISION/SUCCESS":
    case "FEATURE/CREATE/SUCCESS": return uniqueBy('id', [
      ...state,
      action.payload
    ])
    default: return state
  }
}

export default reducer
