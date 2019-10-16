import { CREATE_FEATURE_DEFINITION } from '@story-teller/shared'
import fetchViaHTTP from '../fetch-via-http'

export const createFeature = fetchViaHTTP(CREATE_FEATURE_DEFINITION)
