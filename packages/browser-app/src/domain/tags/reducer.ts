import { Actions, Tag } from './types'
import { uniqueBy } from '../../utils/unique-by'

const initialState: Tag[] = []

const reducer = (state = initialState, action: Actions): Tag[] => {
  switch (action.type) {
    case 'TAG/FETCH/SUCCESS': return uniqueBy('id', [
      ...state,
      ...action.payload
    ])
    default: return state
  }
}

export default reducer
