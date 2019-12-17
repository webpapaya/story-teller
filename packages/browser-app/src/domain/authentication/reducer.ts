import { AuthenticatedUser, Actions } from './types'
import { cache } from '../cache'

const initialState: AuthenticatedUser[] = []

const reducer = (state = initialState, action: Actions): AuthenticatedUser[] => {
  switch (action.type) {
    case 'USER/SESSION/SUCCESS':
      cache.clear()
      return [{
        id: action.payload.id,
        userIdentifier: action.payload.userIdentifier
      }]
    case 'USER/SIGN_OUT/SUCCESS':
      cache.clear()
      return []
    default: return state
  }
}

export default reducer
