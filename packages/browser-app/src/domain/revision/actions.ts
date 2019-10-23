import {Revision} from '@story-teller/shared'
import fetchViaHTTP from '../fetch-via-http'

export const whereRevisions = fetchViaHTTP(Revision.queries.where)
