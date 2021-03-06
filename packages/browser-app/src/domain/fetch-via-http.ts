import { AnyAction } from 'redux'
import { ActionCreator } from './types'
import { CommandDefinition, AnyCodec } from '@story-teller/shared'
import { memoize } from 'redux-memoize'

type FetchViaHTTP = <
  D extends AnyCodec,
  F extends AnyCodec,
  A extends CommandDefinition<D, F>
>(
  definition: A
) => ActionCreator<D['O'], void, AnyAction>

type FetchMemoizedViaHTTP = <
  D extends AnyCodec,
  F extends AnyCodec,
  A extends CommandDefinition<D, F>
>(
  definition: A
) => ActionCreator<D['O'], void, AnyAction> & {
  unmemoized: ActionCreator<D['O'], void, AnyAction>
}

const buildRoute = (values: Array<string | undefined>) =>
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
      payload: payload
    })
    return payload
  } catch (e) {
    console.log(e)
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

export const fetchMemoizedViaHTTP: FetchMemoizedViaHTTP = (definition) => memoize(fetchViaHTTP(definition))

export default fetchViaHTTP
