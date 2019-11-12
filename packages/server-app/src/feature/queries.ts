import sql from 'sql-template-tag'
import { Result, Ok } from 'space-lift'
import { WithinConnection } from '../lib/db'
import { Feature, Tag } from '../domain'
import { PoolClient } from 'pg'

type WhereFeature = (
  deps: { withinConnection: WithinConnection },
) => Promise<Result<never, Feature[]>>

export const whereFeature: WhereFeature = async (deps) => {
  return deps.withinConnection(async ({ client }) => {
    const result = await client.query(sql`
      SELECT DISTINCT ON (original_id) *, tags
      FROM feature f, LATERAL (
        SELECT ARRAY (
           SELECT json_build_object('id', t.id, 'name', t.name, 'color', t.color)
           FROM   tag_for_feature tf
           JOIN   tag       t  ON t.id = tf.tag_id
           WHERE  tf.feature_id = f.id
           ) AS tags
        ) t
      ORDER BY original_id, version DESC;
    `)
    return Ok(result.rows as Feature[])
  })
}

type WhereTags = (
  deps: { withinConnection: WithinConnection },
) => Promise<Result<never, Tag[]>>

export const whereTags: WhereTags = async ({ withinConnection }) => {
  return withinConnection(async ({ client }) => {
    const result = await client.query(sql`
      SELECT *
      FROM tag
      ORDER BY name ASC;
    `)

    return Ok(result.rows as Tag[])
  })
}
