import sql from 'sql-template-strings'
import { Result, Ok, Err} from 'space-lift'
import { Project } from '../domain'
import { PoolClient } from 'pg'

type CreateProject = (
  deps: { client: PoolClient },
  params: { id: string, name: string, userId: string }
) => Promise<Result<never, Project>>

export const createProject: CreateProject = async (deps, params) => {
  const project = await upsertProject(deps, params)
  await assignContributorToProject(deps, {
    projectId: params.id,
    userId: params.userId
  })
  return project
}

type UpsertProject = (
  deps: { client: PoolClient },
  params: { id: string, name: string }
) => Promise<Result<never, Project>>

export const upsertProject: UpsertProject = async (deps, params) => {
  const result = await deps.client.query(sql`
      INSERT INTO project (id, name)
      VALUES (${params.id}, ${params.name})
      ON CONFLICT (id) DO UPDATE
      SET name=EXCLUDED.name
      RETURNING id, name
  `)

  return Ok(result.rows[0])
}

type AssignContributorToProject = (
  deps: { client: PoolClient },
  params: { projectId: string, userId: string }
) => Promise<Result<never, void>>

export const assignContributorToProject: AssignContributorToProject = async (deps, params) => {
  await deps.client.query(sql`
    INSERT INTO contributor (project_id, user_id)
    VALUES (${params.projectId}, ${params.userId})
    ON CONFLICT DO NOTHING
  `)
  return Ok(undefined)
}

type RemoveContributorToProject = (
  deps: { client: PoolClient },
  params: { projectId: string, userId: string }
) => Promise<Result<'AT_LEAST_ONE_CONTRIBUTOR_REQUIRED', void>>

export const removeContributorFromProject: RemoveContributorToProject = async (deps, params) => {
  const result = await deps.client.query(sql`
    DELETE FROM contributor
    WHERE project_id=${params.projectId}
      AND user_id=${params.userId}
      AND (SELECT count(id)
           FROM contributor
           WHERE project_id=${params.projectId}) >= 2
    RETURNING *
  `)

  return result.rowCount === 0
    ? Err('AT_LEAST_ONE_CONTRIBUTOR_REQUIRED')
    : Ok(void 0)
}

type AddFeatureToProject = (
  deps: { client: PoolClient },
  params: { projectId: string, featureId: string }
) => Promise<Result<'AT_LEAST_ONE_CONTRIBUTOR_REQUIRED', void>>

export const addFeatureToProject: AddFeatureToProject = async (deps, params) => {
  const result = await deps.client.query(sql`
    INSERT INTO contributor (project_id, feature_id)
    VALUES (${params.projectId}, ${params.featureId})
    ON CONFLICT DO NOTHING
  `)

  return result.rowCount === 0
    ? Err('AT_LEAST_ONE_CONTRIBUTOR_REQUIRED')
    : Ok(void 0)
}

