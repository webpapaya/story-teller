import { Actions, Project } from './types'
import { uniqueBy } from '../../utils/unique-by'

const initialState: Project[] = []

const reducer = (state = initialState, action: Actions): Project[] => {
  switch (action.type) {
    case 'PROJECT/FETCH/SUCCESS': return uniqueBy(['id'], [
      ...state,
      ...action.payload
    ])
    case 'PROJECT/CREATE/SUCCESS': return uniqueBy(['id'], [
      ...state,
      action.payload
    ])
    default: return state
  }
}

export default reducer
