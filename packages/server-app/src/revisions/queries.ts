import sql from 'sql-template-tag'
import { Result, Ok } from 'space-lift'
import { WithinConnection } from '../lib/db'
import { FeatureRevision } from '../domain'

type WhereRevision = (
  deps: { withinConnection: WithinConnection },
  filter: { featureId: string }
) => Promise<Result<never, FeatureRevision[]>>

export const whereRevision: WhereRevision = async (deps, filter) => {
  return deps.withinConnection(async ({ client }) => {
    const result = await client.query(sql`
      SELECT
        id,
        original_id as feature_id,
        created_at,
        version,
        reason
      FROM feature
      WHERE original_id=${filter.featureId}
    `)

    return Ok(result.rows as FeatureRevision[])
  })
}

