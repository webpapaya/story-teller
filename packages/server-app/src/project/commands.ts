import sql from 'sql-template-strings'
import { Result, Ok } from 'space-lift'
import { WithinConnection } from '../lib/db'
import { Project } from '../domain'


type CreateProject = (
  deps: { withinConnection: WithinConnection },
  params: Project
) => Promise<Result<never, Project>>

export const createProject: CreateProject = async (deps, params) =>
  upsertProject(deps, params)

type UpsertProject = (
  deps: { withinConnection: WithinConnection },
  params: Project
) => Promise<Result<never, Project>>

export const upsertProject: UpsertProject = async (deps, params) => {
  return deps.withinConnection(async ({ client }) => {
    const result = await client.query(sql`
      INSERT INTO project (id, name)
      VALUES (${params.id}, ${params.name})
      ON CONFLICT (id) DO UPDATE
      SET name=EXCLUDED.name
      RETURNING id, name
    `)
    return Ok(result.rows[0])
  })
}