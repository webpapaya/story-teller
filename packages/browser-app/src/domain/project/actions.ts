import { Project } from '@story-teller/shared'
import fetchViaHTTP, { fetchMemoizedViaHTTP } from '../fetch-via-http'

export const whereProjects = fetchMemoizedViaHTTP(Project.queries.whereProjects)
export const createProject = fetchViaHTTP(Project.actions.create)
export const assignContributorToProject = fetchViaHTTP(Project.actions.assignContributor)
