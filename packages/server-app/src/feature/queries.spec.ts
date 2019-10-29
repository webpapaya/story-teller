// @ts-ignore
import { assertThat, hasProperty, hasProperties, everyItem } from 'hamjest'
import { t } from '../spec-helpers'
import uuid from 'uuid'
import { createFeature, updateFeature, ensureTags, setFeatureTags } from './commands'
import { whereFeature } from './queries'

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
      reason: 'Fixed typo'
    }

    await createFeature({ withinConnection }, feature)
    await updateFeature({ withinConnection }, revision)

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

    const result = await whereFeature({ withinConnection })
    assertThat(result.get(), everyItem(hasProperty('originalId', feature.id)))
  }))

  it('returns tags', t(async ({ withinConnection }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description',
    }

    const tag = { id: uuid(), color: '#ff00ff', name: 'bug' }

    await createFeature({ withinConnection }, feature)
    await setFeatureTags({ withinConnection }, { featureId: feature.id, tags: [tag] })

    const result = await whereFeature({ withinConnection })
    assertThat(result.get(), everyItem(hasProperty('tags',
      everyItem(hasProperties(tag)))))
  }))
})
