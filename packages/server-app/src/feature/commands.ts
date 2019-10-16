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
