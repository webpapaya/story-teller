// @ts-ignore
import { rethrowError } from 'promise-frites'
import { Actions } from './types'
import { ActionCreator } from '../types'
import { SESSION_DEFINITION, CommandDefinition } from '@story-teller/shared'

type FetchViaHTTP = <A extends CommandDefinition<unknown>>(
  definition: A
) => ActionCreator<A['validator']['T'], void, Actions>

const fetchViaHTTP: FetchViaHTTP = (definition) => () => async (dispatch, _, { http }) => {
  const response = await http[definition.verb](definition.name, {})
  console.log(response)
}
// await http.post('/sign-in', body)
//   .then(() => dispatch({
//     type: 'USER/SIGN_IN/SUCCESS',
//     payload: void 0
//   }))
//   .catch(rethrowError(() => dispatch({
//     type: 'USER/SIGN_IN/ERROR',
//     payload: void 0
//   })))

export const signIn: ActionCreator<{ userIdentifier: string, password: string}, void, Actions> = (body) => async (dispatch, _, { http }) => {
  await http.post('/sign-in', body)
    .then(() => dispatch({
      type: 'USER/SIGN_IN/SUCCESS',
      payload: void 0
    }))
    .catch(rethrowError(() => dispatch({
      type: 'USER/SIGN_IN/ERROR',
      payload: void 0
    })))
}

export const signUp: ActionCreator<{ userIdentifier: string, password: string}, void, Actions> = (body) => async (dispatch, _, { http }) => {
  await http.post('/sign-up', body)
    .then(() => dispatch({
      type: 'USER/SIGN_UP/SUCCESS',
      payload: void 0
    }))
    .catch(rethrowError(() => dispatch({
      type: 'USER/SIGN_UP/ERROR',
      payload: void 0
    })))
}

export const getAuthenticatedUser = fetchViaHTTP(SESSION_DEFINITION)

// ActionCreator<void, void, Actions> = () => async (dispatch, _, { http }) => {
//   await http.getJSON('/session')
//     .then((payload) => dispatch({
//       type: 'USER/FETCH/SUCCESS',
//       payload
//     }))
//     .catch(rethrowError(() => dispatch({
//       type: 'USER/FETCH/ERROR',
//       payload: void 0
//     })))
// }
