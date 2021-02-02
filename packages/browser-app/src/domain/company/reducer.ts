
import { Actions, Company } from './types'
import { uniqueBy } from '../../utils/unique-by'

const initialState: Company[] = []

const reducer = (state = initialState, action: Actions): Company[] => {
  switch (action.type) {
    case 'COMPANY/FETCH/SUCCESS':
      return uniqueBy(['id'], [
        ...state,
        // @ts-ignore
        ...(Array.isArray(action.payload) ? action.payload : [action]).map((response) => response.payload)
      ])
    case 'COMPANY/CREATE/SUCCESS':
    case 'COMPANY/RENAME/SUCCESS':
      return uniqueBy(['id'], [
        ...state,

        // @ts-ignore
        action.payload.payload
      ])
    default:
      return state
  }
}

export default reducer
