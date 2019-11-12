import { AppState } from "../types";
import { Tag } from "./types";

export const selectTags = (state: AppState): Tag[] => {
  return state.tags
}