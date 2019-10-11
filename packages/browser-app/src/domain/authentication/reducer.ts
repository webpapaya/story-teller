import { AuthenticatedUser, Actions } from './types'

const initialState: AuthenticatedUser[] = []

const reducer = (state = initialState, action: Actions): AuthenticatedUser[] => {
  switch (action.type) {
    case "USER/SESSION/SUCCESS": return [{
      id: action.payload.id,
      userIdentifier: action.payload.userIdentifier
    }]
    case "USER/SIGN_OUT/SUCCESS": return []
    default: return state
  }
}

export default reducer
