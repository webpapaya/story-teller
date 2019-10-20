import sql from 'sql-template-tag'
import { WithinConnection } from '../lib/db'
import { Feature, Result, success } from '../domain'

type CreateFeature = (
  deps: { withinConnection: WithinConnection },
  params: Feature
) => Promise<Result<Feature>>

export const createFeature: CreateFeature = async (deps, params) => {
  return deps.withinConnection(async ({ client }) => {
    const result = await client.query(sql`
      INSERT INTO feature (id, title, description)
      VALUES (${params.id}, ${params.title}, ${params.description})
      returning *
    `)
    return success(result.rows[0])
  })
}

type UpdateFeature = (
  deps: { withinConnection: WithinConnection },
  params: Feature & { previousFeatureId: null | string }
) => Promise<Result<Feature>>

export const createFeatureRevision: UpdateFeature = async (deps, params) => {
  return deps.withinConnection(async ({ client }) => {
    const result = await client.query(sql`
      INSERT INTO feature (id, title, description, previous_feature_id)
      VALUES (
        ${params.id},
        ${params.title},
        ${params.description},
        ${params.previousFeatureId}
      )
      returning *
    `)
    await client.query(sql`
        UPDATE feature
        SET next_feature_id=${params.id}
        WHERE id=${params.previousFeatureId}
    `)
    return success(result.rows[0])
  })
}
