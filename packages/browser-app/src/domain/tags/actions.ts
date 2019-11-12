import { Tags } from '@story-teller/shared'
import fetchViaHTTP from '../fetch-via-http'

export const whereTags = fetchViaHTTP(Tags.queries.where)
