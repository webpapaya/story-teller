import { Revision } from '@story-teller/shared'
import fetchViaHTTP, { fetchMemoizedViaHTTP } from '../fetch-via-http'

export const whereRevisions = fetchMemoizedViaHTTP(Revision.queries.where)
