import sql from 'sql-template-tag'
import { Result, Ok } from 'space-lift'
import { WithinConnection } from '../lib/db'
import { Feature } from '../domain'

type CreateFeature = (
  deps: { withinConnection: WithinConnection },
  params: Feature
) => Promise<Result<never, Feature>>

export const createFeature: CreateFeature = async (deps, params) => {
  return updateFeature(deps, {
    ...params,
    originalId: params.id,
  })
}

type UpdateFeature = (
  deps: { withinConnection: WithinConnection },
  params: Feature & { originalId: null | string }
) => Promise<Result<never, Feature>>

export const updateFeature: UpdateFeature = async (deps, params) => {
  return deps.withinConnection(async ({ client }) => {
    const result = await client.query(sql`
      INSERT INTO feature (id, title, description, original_id, version)
      VALUES (
        ${params.id},
        ${params.title},
        ${params.description},
        ${params.originalId},
        (
          SELECT count(*)
          FROM feature
          WHERE original_id = ${params.originalId}
        )
      )
      RETURNING *
    `)

    return Ok(result.rows[0])
  })
}
