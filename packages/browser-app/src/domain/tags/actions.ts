import { Tags } from '@story-teller/shared'
import { fetchMemoizedViaHTTP } from '../fetch-via-http'

export const whereTags = fetchMemoizedViaHTTP(Tags.queries.where)
