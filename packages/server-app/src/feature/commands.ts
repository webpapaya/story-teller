import sql from "sql-template-tag"
import { WithinConnection } from "../lib/db"
import { Feature, Result, success } from "../domain"

type CreateFeature = (
  deps: { withinConnection: WithinConnection },
  params: Feature
) => Promise<Result<void>>

export const createFeature: CreateFeature = async (deps, params) => {
  return deps.withinConnection(async ({ client }) => {
    await client.query(sql`
      INSERT INTO feature (id, title, description)
      VALUES (${params.id}, ${params.title}, ${params.description})
    `)
    return success(void 0);
  })
}