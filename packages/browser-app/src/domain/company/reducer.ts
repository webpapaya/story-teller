
import { Actions, Company } from './types'
import { uniqueBy } from '../../utils/unique-by'

const initialState: Company[] = []

const reducer = (state = initialState, action: Actions): Company[] => {
  switch (action.type) {
    case 'COMPANY/FETCH/SUCCESS':
      return uniqueBy(['id'], [
        ...state,
        ...action.payload.map((response) => response.payload)
      ])
    default:
      return state
  }
}

export default reducer
