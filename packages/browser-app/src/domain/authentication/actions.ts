// @ts-ignore
import { rethrowError } from 'promise-frites'
import { Actions } from './types'
import { ActionCreator } from '../types'

export const signIn: ActionCreator<{ userIdentifier: string, password: string}, void, Actions> = (body) => async (dispatch, _, { http }) => http.post('/sign-in', body)
  .then(() => dispatch({
    type: 'USER/SIGN_IN/SUCCESS',
    payload: void 0
  }))
  .catch(rethrowError(() => dispatch({
    type: 'USER/SIGN_IN/ERROR',
    payload: void 0
  })))


export const signUp: ActionCreator<{ userIdentifier: string, password: string}, void, Actions> = (body) => async (dispatch, _, { http }) => http.post('/sign-up', body)
  .then(() => dispatch({
    type: 'USER/SIGN_UP/SUCCESS',
    payload: void 0
  }))
  .catch(rethrowError(() => dispatch({
    type: 'USER/SIGN_UP/ERROR',
    payload: void 0
  })))
