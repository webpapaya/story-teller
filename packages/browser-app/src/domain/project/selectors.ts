import { AppState } from '../types'
import { Project } from './types'
import { History } from 'history'
import { readQSFromLocation, writeQSToLocation } from '../../utils/location-helper'

export const selectProjects = (state: AppState): Project[] => {
  return state.projects
}

export const selectActiveProjects = (history: History) => readQSFromLocation(history, 'projects', [])

export const writeActiveProjects = (history: History, values: string[]) => writeQSToLocation(history, 'projects', values)