import { CREATE_FEATURE_DEFINITION, LIST_FEATURES_DEFINITION } from '@story-teller/shared'
import fetchViaHTTP from '../fetch-via-http'

export const createFeature = fetchViaHTTP(CREATE_FEATURE_DEFINITION)
export const whereFeature = fetchViaHTTP(LIST_FEATURES_DEFINITION)
