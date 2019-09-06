import { Actions } from './types'
import { ActionCreator } from '../types'

export const signIn: ActionCreator<{ userIdentifier: string, password: string}, void, Actions> = (body) => async (dispatch, _, { http }) => {
  try {
    await http.post('/sign-in', body)
    dispatch({
      type: 'USER/SIGN_IN/SUCCESS',
      payload: void 0
    })
  } catch (e) {
    dispatch({
      type: 'USER/SIGN_IN/ERROR',
      payload: void 0
    })
    throw e
  }
}
