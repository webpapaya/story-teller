import sql from 'sql-template-tag'
import { Result, Ok } from 'space-lift'
import { WithinConnection } from '../lib/db'
import { Feature } from '../domain'

type WhereFeature = (
  deps: { withinConnection: WithinConnection },
) => Promise<Result<never, Feature[]>>

export const whereFeature: WhereFeature = async (deps) => {
  return deps.withinConnection(async ({ client }) => {
    const result = await client.query(sql`
      SELECT DISTINCT ON (original_id) *
      FROM feature
      ORDER BY original_id, version DESC;
    `)
    return Ok(result.rows as Feature[])
  })
}
