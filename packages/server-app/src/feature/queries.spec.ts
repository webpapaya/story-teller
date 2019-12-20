// @ts-ignore
import { assertThat, hasProperty, hasProperties, everyItem, allOf } from 'hamjest'
import { t } from '../spec-helpers'
import uuid from 'uuid'
import { createFeature, updateFeature, ensureTags, setFeatureTags } from './commands'
import { whereFeature, whereTags } from './queries'

describe('whereFeature', () => {
  it('finds queries in a db', t(async ({ client }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description'
    }

    await createFeature({ client }, feature)
    const features = await whereFeature({ client })
    assertThat(features.get(), hasProperties({
      0: hasProperties(feature)
    }))
  }))

  it('returns latest revision only', t(async ({ withinConnection, client }) => {
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

    await createFeature({ client }, feature)
    await updateFeature({ client }, revision)

    const features = await whereFeature({ client })
    assertThat(features.get(), hasProperties({
      0: hasProperties(revision)
    }))
  }))

  it('returns originalId property', t(async ({ client }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description'
    }

    const result = await whereFeature({ client })
    assertThat(result.get(), everyItem(hasProperty('originalId', feature.id)))
  }))

  it('returns tags', t(async ({ withinConnection, client }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description'
    }

    const tag = { id: uuid(), color: '#ff00ff', name: 'bug' }

    await createFeature({ client }, feature)
    await setFeatureTags({ client }, { featureId: feature.id, tags: [tag] })

    const result = await whereFeature({ client })
    assertThat(result.get(), everyItem(hasProperty('tags',
      everyItem(hasProperties(tag)))))
  }))
})

describe('whereTags', () => {
  it('returns a list of tags', t(async ({ client }) => {
    const tag = { id: uuid(), color: '#ff00ff', name: 'bug' }
    await ensureTags({ client }, { tags: [tag] })

    const result = await whereTags({ client })

    assertThat(result.get(), allOf(
      hasProperty('length', 1),
      everyItem(hasProperties(tag))))
  }))
})
