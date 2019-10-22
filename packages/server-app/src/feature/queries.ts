import sql from 'sql-template-tag'
import { WithinConnection } from '../lib/db'
import { Feature, Result, success } from '../domain'

type WhereFeature = (
  deps: { withinConnection: WithinConnection },
) => Promise<Result<Feature[]>>

export const whereFeature: WhereFeature = async (deps) => {
  return deps.withinConnection(async ({ client }) => {
    const result = await client.query(sql`
      SELECT DISTINCT ON (original_id) *
      FROM feature
      ORDER BY original_id, version DESC;
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
      SELECT *
      FROM feature
      WHERE original_id = ${params.id}
    `)
    return success(result.rows)
  })
}
