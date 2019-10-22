import sql from 'sql-template-tag'
import { WithinConnection } from '../lib/db'
import { Feature, Result, success } from '../domain'

type CreateFeature = (
  deps: { withinConnection: WithinConnection },
  params: Feature
) => Promise<Result<Feature>>

export const createFeature: CreateFeature = async (deps, params) => {
  return createFeatureRevision(deps, {
    ...params,
    originalId: params.id,
  })
}

type CreateFeatureRevision = (
  deps: { withinConnection: WithinConnection },
  params: Feature & { originalId: null | string }
) => Promise<Result<Feature>>

export const createFeatureRevision: CreateFeatureRevision = async (deps, params) => {
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
      returning *
    `)

    return success(result.rows[0])
  })
}
