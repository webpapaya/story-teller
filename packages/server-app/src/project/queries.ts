import sql from 'sql-template-strings'
import { Result, Ok } from 'space-lift'
import { Project, Contributor } from '../domain'
import { PoolClient } from 'pg'

type QueryProject = (
  deps: { client: PoolClient },
  params: { userId: string }
) => Promise<Result<never, Contributor[]>>

export const queryProject: QueryProject = async (deps, params) => {
  const result = await deps.client.query(sql`
    SELECT
      project.id as id,
      project.name as name
    FROM project
    LEFT JOIN contributor on project.id = contributor.project_id
    WHERE contributor.user_id = ${params.userId}
  `.setName('query_project'))

  return Ok(result.rows)
}

type QueryContributors = (
  deps: { client: PoolClient },
  params: { projectId: string }
) => Promise<Result<never, Project[]>>

export const queryContributors: QueryContributors = async (deps, params) => {
  const result = await deps.client.query(sql`
    SELECT
      contributor.user_id as user_id,
      contributor.project_id as project_id,
      user_authentication.user_identifier as name
    FROM contributor
    LEFT JOIN user_authentication on user_authentication.id = contributor.user_id
    WHERE contributor.project_id = ${params.projectId}
  `.setName('query_contributors'))

  return Ok(result.rows)
}
