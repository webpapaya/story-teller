import sql from 'sql-template-strings'
import { Result, Ok } from 'space-lift'
import { WithinConnection } from '../lib/db'
import { Feature, Tag } from '../domain'
import { uniqueBy } from '../utils/unique-by'

type CreateFeature = (
  deps: { withinConnection: WithinConnection },
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
  deps: { withinConnection: WithinConnection },
  params: Feature & { originalId: string, reason: string }
) => Promise<Result<never, Feature>>

export const updateFeature: UpdateFeature = async (deps, params) => {
  return deps.withinConnection(async ({ client }) => {
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
  })
}



type UnassignTagsFromFeature = (
  deps: { withinConnection: WithinConnection },
  params: { featureId: string, tags: Tag[] }
) => Promise<Result<never, undefined>>

const unassignTagsFromFeature: UnassignTagsFromFeature = async (deps, params) => {
  return deps.withinConnection(async ({ client }) => {
    const deleteQuery = sql`
      DELETE FROM tag_for_feature
      WHERE feature_id=${params.featureId}
    `
    params.tags.forEach((tag) => {
      deleteQuery.append(sql`AND tag_id != ${tag.id}`)
    })

    await client.query(deleteQuery)
    return Ok(undefined)
  })
}


type AssignTagsToFeature = (
  deps: { withinConnection: WithinConnection },
  params: { featureId: string, tags: Tag[] }
) => Promise<Result<never, undefined>>

const assignTagsToFeature: AssignTagsToFeature = async (deps, params) => {
  if (!params.tags.length) { return Ok(undefined) }

  return deps.withinConnection(async ({ client }) => {
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
  })
}

type SetFeatureTags = (
  deps: { withinConnection: WithinConnection },
  params: { featureId: string, tags: Tag[] }
) => Promise<Result<never, Tag>>

export const setFeatureTags: SetFeatureTags = async (deps, params) => {
  return deps.withinConnection(async ({ client }) => {
    await ensureTags(deps, { tags: params.tags })
    await unassignTagsFromFeature(deps, params)
    await assignTagsToFeature(deps, params)

    return 1 as any
  })
}


type EnsureTags = (
  deps: { withinConnection: WithinConnection },
  params: { tags: Tag[] }
) => Promise<Result<never, Tag[]>>

export const ensureTags: EnsureTags = async (deps, params) => {
  if (!params.tags.length) { return Ok([]) }

  return deps.withinConnection(async ({ client }) => {
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
    await client.query(query);

    return Ok(params.tags)
  })
}
