import { AnyAction } from 'redux'
import { ActionCreator } from './types'
import { CommandDefinition } from '@story-teller/shared'

type FetchViaHTTP = <A extends CommandDefinition<unknown, unknown>>(
  definition: A
) => ActionCreator<A['validator']['T'], void, AnyAction>

const buildRoute = (values: (string | undefined)[] ) =>
  values.filter(x => x).join('/')

const buildType = (values: string[]) =>
  buildRoute(values).replace(/-/g, '_').toUpperCase()

const fetchViaHTTP: FetchViaHTTP = (definition) => (body) => async (dispatch, _, { http }) => {
  const route = buildRoute([
    definition.model,
    definition.action
  ])

  dispatch({
    type: buildType([
      definition.model,
      definition.action || 'FETCH',
      'INITIATED'
    ]),
    payload: body
  })

  try {
    const payload = await http[definition.verb](`/${route}`, body)
      .then((r) => r.json())

    dispatch({
      type: buildType([
        definition.model,
        definition.action || 'FETCH',
        'SUCCESS'
      ]),
      payload
    })
    return payload
  } catch (e) {
    dispatch({
      type: buildType([
        definition.model,
        definition.action || 'FETCH',
        'ERROR'
      ]),
      payload: body
    })
    return body
  }
}

export default fetchViaHTTP;