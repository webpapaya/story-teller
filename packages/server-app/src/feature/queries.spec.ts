// @ts-ignore
import { assertThat, hasProperty, hasProperties, everyItem } from 'hamjest'
import { t } from '../spec-helpers'
import uuid from 'uuid'
import { createFeature, createFeatureRevision } from './commands'
import { whereFeature, whereFeatureRevision } from './queries'

describe('whereFeature', () => {
  it('finds queries in a db', t(async ({ withinConnection }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description',
    }

    await createFeature({ withinConnection }, feature)
    const features = await whereFeature({ withinConnection })
    assertThat(features.get(), hasProperties({
      0: hasProperties(feature)
    }))
  }))

  it('returns latest revision only', t(async ({ withinConnection }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description'
    }

    const revision = {
      id: uuid(),
      title: 'updated',
      description: 'updated',
      originalId: feature.id,
    }

    await createFeature({ withinConnection }, feature)
    await createFeatureRevision({ withinConnection }, revision)

    const features = await whereFeature({ withinConnection })
    assertThat(features.get(), hasProperties({
      0: hasProperties(revision)
    }))
  }))

  it('returns originalId property', t(async ({ withinConnection }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description',
    }

    await createFeature({ withinConnection }, feature)
    const result = await whereFeature({ withinConnection })

    assertThat(result.get(), everyItem(hasProperty('originalId', feature.id)))
  }))
})

describe('whereFeatureRevision', () => {
  it('returns all revisions for id', t(async ({ withinConnection }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description',
    }
    const revision = {
      id: uuid(),
      title: 'updated',
      description: 'updated',
      originalId: feature.id,
    }

    await createFeature({ withinConnection }, feature)
    await createFeatureRevision({ withinConnection }, revision)

    const result = await whereFeatureRevision({ withinConnection }, { id: feature.id })
    assertThat(result.get(), hasProperties({
        0: hasProperties(feature),
        1: hasProperties(revision)
      }))
  }))

  it('returns originalId property', t(async ({ withinConnection }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description',
    }
    const revision = {
      id: uuid(),
      title: 'updated',
      description: 'updated',
      originalId: feature.id,
    }

    await createFeature({ withinConnection }, feature)
    await createFeatureRevision({ withinConnection }, revision)
    const result = await whereFeatureRevision({ withinConnection }, { id: feature.id })

    assertThat(result.get(), everyItem(hasProperty('originalId', feature.id)))
  }))
})
