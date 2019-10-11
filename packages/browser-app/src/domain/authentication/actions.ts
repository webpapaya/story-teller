import { ActionCreator } from '../types'
import { SESSION_DEFINITION, CommandDefinition, SIGN_IN_DEFINITION, SIGN_UP_DEFINITION } from '@story-teller/shared'
import { AnyAction } from 'redux'

type FetchViaHTTP = <A extends CommandDefinition<unknown>>(
  definition: A
) => ActionCreator<A['validator']['T'], void, AnyAction>

const fetchViaHTTP: FetchViaHTTP = (definition) => (body) => async (dispatch, _, { http }) => {
  const payload = await http[definition.verb](`/${definition.name}`, body).then((r) => r.json())
  dispatch({
    type: `${definition.name}/FETCH/SUCCESS`.toUpperCase(),
    payload
  })
  return payload
}

export const signIn = fetchViaHTTP(SIGN_IN_DEFINITION)
export const signUp = fetchViaHTTP(SIGN_UP_DEFINITION)
export const getAuthenticatedUser = fetchViaHTTP(SESSION_DEFINITION)
