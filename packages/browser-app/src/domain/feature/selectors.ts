import { AppState } from "../types";
import { Feature } from "./types";

const findLatestFeatures = (features: Feature[]): Feature[] => {
  return Object.values(features.reduce((result, obj) => {
    // @ts-ignore
    const currentItem: Feature = result[obj.originalId]
    if (!currentItem || currentItem.version < obj.version) {
      // @ts-ignore
      result[obj.originalId] = obj
    }

    return result
  }, {}));
}

export const selectFeatures = (state: AppState): Feature[] =>
  findLatestFeatures(state.features)

export const selectFeature = (state: AppState, id: string): Feature => {
  const relevantFeatures = state.features
    .filter((feature) => feature.originalId === id)

  return findLatestFeatures(relevantFeatures)[0];
}