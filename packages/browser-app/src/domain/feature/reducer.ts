import { Feature, Actions } from './types'

const initialState: Feature[] = []

const reducer = (state = initialState, action: Actions): Feature[] => {
  switch (action.type) {
    case "FEATURE/FETCH/SUCCESS": return action.payload
    case "FEATURE/CREATE/SUCCESS": return [
      ...state,
      action.payload
    ]
    default: return state
  }
}

export default reducer