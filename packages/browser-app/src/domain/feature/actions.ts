import { Feature } from '@story-teller/shared'
import fetchViaHTTP from '../fetch-via-http'

export const createFeature = fetchViaHTTP(Feature.actions.create)
export const updateFeature = fetchViaHTTP(Feature.actions.update)
export const whereFeature = fetchViaHTTP(Feature.queries.where)
export const setTags = fetchViaHTTP(Feature.actions.setTags)
