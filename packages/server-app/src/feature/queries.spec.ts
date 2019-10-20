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
      nextFeatureId: null,
      previousFeatureId: null,
    }

    await createFeature({ withinConnection }, feature)

    assertThat(await whereFeature({ withinConnection }),
      hasProperty('body',  hasProperties({
        0: hasProperties(feature)
      })))
  }))

  it('returns latest revision only', t(async ({ withinConnection }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description',
      nextFeatureId: null,
      previousFeatureId: null,
    }
    const revision = {
      id: uuid(),
      title: 'updated',
      description: 'updated',
      nextFeatureId: null,
      previousFeatureId: feature.id,
    }

    await createFeature({ withinConnection }, feature)
    await createFeatureRevision({ withinConnection }, revision)

    assertThat(await whereFeature({ withinConnection }),
      hasProperty('body', hasProperties({
        0: hasProperties(revision)
      })))
  }))

  it('returns originalFeatureId property', t(async ({ withinConnection }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description',
    }

    await createFeature({ withinConnection }, feature)
    const result = await whereFeature({ withinConnection })

    assertThat(result.body, everyItem(hasProperty('originalFeatureId', feature.id)))
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
      nextFeatureId: null,
      previousFeatureId: feature.id,
    }

    await createFeature({ withinConnection }, feature)
    await createFeatureRevision({ withinConnection }, revision)

    assertThat(await whereFeatureRevision({ withinConnection }, { id: revision.id }),
      hasProperty('body', hasProperties({
        0: hasProperties(revision),
        1: hasProperties(feature)
      })))
  }))

  it('returns originalFeatureId property', t(async ({ withinConnection }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description',
    }
    const revision = {
      id: uuid(),
      title: 'updated',
      description: 'updated',
      nextFeatureId: null,
      previousFeatureId: feature.id,
    }

    await createFeature({ withinConnection }, feature)
    await createFeatureRevision({ withinConnection }, revision)
    const result = await whereFeatureRevision({ withinConnection }, { id: revision.id })

    assertThat(result.body, everyItem(hasProperty('originalFeatureId', revision.id)))
  }))
})
