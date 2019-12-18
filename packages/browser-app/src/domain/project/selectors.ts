import { AppState } from '../types'
import { Project } from './types'

export const selectProjects = (state: AppState): Project[] => {
  return state.projects
}
