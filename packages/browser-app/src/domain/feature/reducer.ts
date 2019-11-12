import { Feature, Actions } from './types'
import { uniqueBy } from '../../utils/unique-by'

const initialState: Feature[] = []

const reducer = (state = initialState, action: Actions): Feature[] => {
  switch (action.type) {
    case "FEATURE_REVISION/FETCH/SUCCESS":
    case "FEATURE/FETCH/SUCCESS":
        return uniqueBy('id', [
          ...state,
          ...action.payload
        ])

    case "FEATURE/UPDATE/SUCCESS":
    case "FEATURE/CREATE/SUCCESS": return uniqueBy('id', [
      ...state,
      action.payload
    ])

    case "FEATURE/SET_TAGS/SUCCESS":
        const feature = state.find((f) => f.originalId === action.payload.featureId)
        if (!feature) { return state; }

        return uniqueBy('id', [
          ...state,
          { ...feature, tags: action.payload.tags }
        ])

    default: return state
  }
}

export default reducer
