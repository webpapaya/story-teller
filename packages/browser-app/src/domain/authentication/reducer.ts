import { Actions } from './types'
import { cache } from '../cache'

type State = {
  state: 'authenticated' | 'not authenticated'
  id?: string
  jwtToken?: string
}

const defaultState: State = {
  state: 'not authenticated' as const,
  id: '',
  jwtToken: ''
}

const reducer = (state = defaultState, action: Actions): State => {
  switch (action.type) {
    case 'AUTHENTICATION/SIGN_IN/SUCCESS':
      return {
        state: 'authenticated' as const,
        id: action.payload.id,
        jwtToken: action.payload.jwtToken
      }
    case 'AUTHENTICATION/SIGN_OUT/SUCCESS':
      cache.clear()
      return defaultState

    default: return state
  }
}

export default reducer
