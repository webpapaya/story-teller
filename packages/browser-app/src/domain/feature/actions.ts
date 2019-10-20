import {
  CREATE_FEATURE_DEFINITION,
  LIST_FEATURES_DEFINITION,
  CREATE_FEATURE_REVISION_DEFINITION,
  LIST_FEATURE_REVISIONS_DEFINITION
} from '@story-teller/shared'
import fetchViaHTTP from '../fetch-via-http'

export const createFeature = fetchViaHTTP(CREATE_FEATURE_DEFINITION)
export const createFeatureRevision = fetchViaHTTP(CREATE_FEATURE_REVISION_DEFINITION)
export const whereFeature = fetchViaHTTP(LIST_FEATURES_DEFINITION)
export const whereFeatureRevisions = fetchViaHTTP(LIST_FEATURE_REVISIONS_DEFINITION)
