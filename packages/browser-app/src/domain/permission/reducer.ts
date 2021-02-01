
import { Actions, State } from './types'

const initialState: State = {}

const reducer = (state = initialState, action: Actions): State => {
  const actionPayload = Array.isArray(action.payload)
    ? action.payload
    : [action.payload]

  if (Array.isArray(action.payload)) {
    return {
      ...state,
      ...actionPayload
        .filter((maybeLink) => maybeLink.links)
        .reduce((result, item) => {
          result[item.payload.id] = item.links
          return result
        }, {} as State)
    }
  }
  return state
}

export default reducer
