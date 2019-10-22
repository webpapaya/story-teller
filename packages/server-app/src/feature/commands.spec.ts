// @ts-ignore
import { assertThat, hasProperties } from 'hamjest'
import { t, assertDifference } from '../spec-helpers'
import uuid from 'uuid'
import { createFeature, createFeatureRevision as createFeatureRevision } from './commands'

describe('createFeature', () => {
  it('creates a new record', t(async ({ withinConnection }) => {
    return assertDifference({ withinConnection }, 'feature', 1, async () => {
      await createFeature({ withinConnection }, {
        id: uuid(),
        title: 'A new feature',
        description: 'A feature description'
      })
    })
  }))
})

describe('createFeatureRevision', () => {
  it('creates a new record', t(async ({ withinConnection }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description'
    }

    await createFeature({ withinConnection }, feature)

    const updatedFeature = {
      ...feature,
      id: uuid(),
      title: 'Updated',
      description: 'Updated',
      originalId: feature.id
    }

    const result = await createFeatureRevision({ withinConnection }, updatedFeature)
    assertThat(result.get(), hasProperties(updatedFeature))
  }))
})

