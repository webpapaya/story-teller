import sql from 'sql-template-tag'
import { WithinConnection } from '../lib/db'
import { Feature, Result, success } from '../domain'

type WhereFeature = (
  deps: { withinConnection: WithinConnection },
) => Promise<Result<Feature[]>>

export const whereFeature: WhereFeature = async (deps) => {
  return deps.withinConnection(async ({ client }) => {
    const result = await client.query(sql`
      select * from feature;
    `)
    return success(result.rows)
  })
}
