import sql from 'sql-template-strings'
import { Result, Ok } from 'space-lift'
import { Feature, Tag } from '../domain'
import { uniqueBy } from '../utils/unique-by'
import { PoolClient } from 'pg'

type CreateFeature = (
  deps: { client: PoolClient },
  params: Feature
) => Promise<Result<never, Feature>>

export const createFeature: CreateFeature = async (deps, params) => {
  return updateFeature(deps, {
    ...params,
    originalId: params.id,
    reason: 'Creation'
  })
}

type UpdateFeature = (
  deps: { client: PoolClient },
  params: Feature & { originalId: string, reason: string }
) => Promise<Result<never, Feature>>

export const updateFeature: UpdateFeature = async ({ client }, params) => {
  const result = await client.query(sql`
    INSERT INTO feature (id, title, description, original_id, reason, version)
    VALUES (
      ${params.id},
      ${params.title},
      ${params.description},
      ${params.originalId},
      ${params.reason},
      (
        SELECT count(*)
        FROM feature
        WHERE original_id = ${params.originalId}
      )
    )
    RETURNING *
  `)

  return Ok(result.rows[0])
}

type UnassignTagsFromFeature = (
  deps: { client: PoolClient },
  params: { featureId: string, tags: Tag[] }
) => Promise<Result<never, undefined>>

const unassignTagsFromFeature: UnassignTagsFromFeature = async ({ client }, params) => {
  const deleteQuery = sql`
    DELETE FROM tag_for_feature
    WHERE feature_id=${params.featureId}
  `
  params.tags.forEach((tag) => {
    deleteQuery.append(sql`AND tag_id != ${tag.id}`)
  })

  await client.query(deleteQuery)
  return Ok(undefined)
}

type AssignTagsToFeature = (
  deps: { client: PoolClient },
  params: { featureId: string, tags: Tag[] }
) => Promise<Result<never, undefined>>

const assignTagsToFeature: AssignTagsToFeature = async ({ client }, params) => {
  if (!params.tags.length) { return Ok(undefined) }

  const insertQuery = sql`INSERT INTO tag_for_feature (feature_id, tag_id) VALUES `
  params.tags.forEach((tag, index) => {
    if (index === 0) {
      insertQuery.append(sql`(${params.featureId}, ${tag.id})`)
    } else {
      insertQuery.append(sql`, (${params.featureId}, ${tag.id})`)
    }
  })
  await client.query(insertQuery)
  return Ok(undefined)
}

type SetFeatureTags = (
  deps: { client: PoolClient },
  params: { featureId: string, tags: Tag[] }
) => Promise<Result<never, Tag[]>>

export const setFeatureTags: SetFeatureTags = async ({ client }, params) => {
  await ensureTags({ client }, { tags: params.tags })
  await unassignTagsFromFeature({ client }, params)
  await assignTagsToFeature({ client }, params)

  return Ok(params.tags)
}

type EnsureTags = (
  deps: { client: PoolClient },
  params: { tags: Tag[] }
) => Promise<Result<never, Tag[]>>

export const ensureTags: EnsureTags = async ({ client }, params) => {
  if (!params.tags.length) { return Ok([]) }

  const query = sql`INSERT INTO tag (id, name, color) VALUES `
  uniqueBy('id', params.tags).forEach((tag, index) => {
    if (index === 0) {
      query.append(sql`(${tag.id}, ${tag.name}, ${tag.color})`)
    } else {
      query.append(sql`, (${tag.id}, ${tag.name}, ${tag.color})`)
    }
  })
  query.append(sql`
    ON CONFLICT (id)
    DO UPDATE
    SET name=EXCLUDED.name, color=EXCLUDED.color
  `)
  await client.query(query)

  return Ok(params.tags)
}
