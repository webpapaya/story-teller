import { AppState } from "../types";

export const selectFeatures = (state: AppState) => {
  return state.features.filter((feature) => {
    return feature.nextFeatureId === null
  })
}