import {
  LIST_REVISIONS_COMMAND
} from '@story-teller/shared'
import fetchViaHTTP from '../fetch-via-http'

export const whereRevisions = fetchViaHTTP(LIST_REVISIONS_COMMAND)
