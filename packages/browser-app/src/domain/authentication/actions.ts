import { AnyAction } from 'redux'
import { ActionCreator } from '../types'
import { SESSION_DEFINITION, CommandDefinition, SIGN_IN_DEFINITION, SIGN_UP_DEFINITION, SIGN_OUT_DEFINITION } from '@story-teller/shared'

type FetchViaHTTP = <A extends CommandDefinition<unknown, unknown>>(
  definition: A
) => ActionCreator<A['validator']['T'], void, AnyAction>

const fetchViaHTTP: FetchViaHTTP = (definition) => (body) => async (dispatch, _, { http }) => {
  const route = [
    definition.model,
    definition.action
  ].filter(x => x).join('/')

  const payload = await http[definition.verb](`/${route}`, body).then((r) => r.json()).catch(() => undefined)

  dispatch({
    type: [
      definition.model,
      definition.action || 'FETCH',
      'SUCCESS'
    ].join('/').replace(/-/g, '_').toUpperCase(),
    payload
  })

  return payload
}

export const signIn = fetchViaHTTP(SIGN_IN_DEFINITION)
export const signUp = fetchViaHTTP(SIGN_UP_DEFINITION)
export const signOut = fetchViaHTTP(SIGN_OUT_DEFINITION)
export const getAuthenticatedUser = fetchViaHTTP(SESSION_DEFINITION)
