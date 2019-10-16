import { AnyAction } from 'redux'
import { ActionCreator } from './types'
import { CommandDefinition } from '@story-teller/shared'

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

export default fetchViaHTTP;