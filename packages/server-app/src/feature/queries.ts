import sql from 'sql-template-tag'
import { Result, Ok, Err } from 'space-lift'
import { Tags, Feature } from '@story-teller/shared'
import { PoolClient } from 'pg'

type WhereFeature = (
  deps: { client: PoolClient },
) => Promise<Result<'DOMAIN_ERROR', Array<typeof Feature.aggregate['O']>>>

export const whereFeature: WhereFeature = async (deps) => {
  const result = await deps.client.query(sql`
      SELECT DISTINCT ON (original_id) *, tags
      FROM feature f, LATERAL (
        SELECT ARRAY (
          SELECT json_build_object('id', t.id, 'name', t.name, 'color', t.color)
          FROM   tag_for_feature tf
          JOIN   tag t ON t.id = tf.tag_id
          WHERE  tf.feature_id = f.original_id
        ) AS tags
      ) t
      ORDER BY original_id, version DESC;
    `)

  if (Feature.aggregate.isCollection(result.rows)) {
    return Ok(result.rows)
  }
  return Err('DOMAIN_ERROR' as const)
}

type WhereTags = (
  deps: { client: PoolClient },
) => Promise<Result<'DOMAIN_ERROR', Array<typeof Tags.aggregate['O']>>>

export const whereTags: WhereTags = async ({ client }) => {
  const result = await client.query(sql`
      SELECT *
      FROM tag
      ORDER BY name ASC;
    `)

  if (Tags.aggregate.isCollection(result.rows)) {
    return Ok(result.rows)
  }
  return Err('DOMAIN_ERROR' as const)
}
