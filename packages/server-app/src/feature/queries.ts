import sql from 'sql-template-tag'
import { WithinConnection } from '../lib/db'
import { Feature, Result, success } from '../domain'

type WhereFeature = (
  deps: { withinConnection: WithinConnection },
) => Promise<Result<Feature[]>>

export const whereFeature: WhereFeature = async (deps) => {
  return deps.withinConnection(async ({ client }) => {
    const result = await client.query(sql`
      SELECT
        *,
        id as original_feature_id
      FROM feature
      WHERE next_feature_id IS NULL;
    `)
    return success(result.rows)
  })
}

type WhereFeatureRevision = (
  deps: { withinConnection: WithinConnection },
  params: { id: string }
) => Promise<Result<Feature[]>>

export const whereFeatureRevision: WhereFeatureRevision = async (deps, params) => {
  return deps.withinConnection(async ({ client }) => {
    const result = await client.query(sql`
      WITH RECURSIVE subordinates AS (
        SELECT *
        FROM feature
        WHERE id = ${params.id}
        UNION
          SELECT e.*
          FROM feature e
          INNER JOIN subordinates s ON s.previous_feature_id = e.id
      ) SELECT
          *,
          ${params.id} as original_feature_id
        FROM subordinates;
    `)
    return success(result.rows)
  })
}
