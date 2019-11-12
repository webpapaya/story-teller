import { Actions, Revision } from './types'
import { uniqueBy } from '../../utils/unique-by'

const initialState: Revision[] = []

const reducer = (state = initialState, action: Actions): Revision[] => {
  switch (action.type) {
    case 'REVISION/FETCH/SUCCESS':
      return uniqueBy('id', [
        ...state,
        ...action.payload
      ])

    default: return state
  }
}

export default reducer
