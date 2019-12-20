import sql from 'sql-template-tag'
import { Result, Ok } from 'space-lift'
import { FeatureRevision } from '../domain'
import { PoolClient } from 'pg'

type WhereRevision = (
  deps: { client: PoolClient },
  filter: { featureId: string }
) => Promise<Result<never, FeatureRevision[]>>

export const whereRevision: WhereRevision = async ({ client }, filter) => {
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
}
