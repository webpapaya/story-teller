import {
  CREATE_FEATURE_COMMAND,
  LIST_FEATURES_COMMAND,
  CREATE_FEATURE_REVISION_COMMAND,
  LIST_FEATURE_REVISIONS_COMMAND
} from '@story-teller/shared'
import fetchViaHTTP from '../fetch-via-http'

export const createFeature = fetchViaHTTP(CREATE_FEATURE_COMMAND)
export const createFeatureRevision = fetchViaHTTP(CREATE_FEATURE_REVISION_COMMAND)
export const whereFeature = fetchViaHTTP(LIST_FEATURES_COMMAND)
export const whereFeatureRevisions = fetchViaHTTP(LIST_FEATURE_REVISIONS_COMMAND)
