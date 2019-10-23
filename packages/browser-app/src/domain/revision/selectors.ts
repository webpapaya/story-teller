import { AppState } from "../types";
import { Revision } from "./types";

export const whereRevisionForFeature = (appState: AppState, featureId: string): Revision[] => {
  return appState.revisions
    .filter((revision) => revision.featureId === featureId)
}
