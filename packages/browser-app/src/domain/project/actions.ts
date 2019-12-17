import { Tags, Project } from '@story-teller/shared'
import fetchViaHTTP from '../fetch-via-http'

export const whereProjects = fetchViaHTTP(Project.queries.whereProjects)
export const createProject = fetchViaHTTP(Project.actions.create)
export const assignContributorToProject = fetchViaHTTP(Project.actions.assignContributor)
