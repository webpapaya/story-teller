// @ts-ignore
import { assertThat, hasProperties } from 'hamjest'
import { t, assertDifference } from '../spec-helpers'
import uuid from 'uuid'
import { createFeature, updateFeature as updateFeature, setFeatureTags, ensureTags } from './commands'

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
      originalId: feature.id,
      reason: 'Fixed typo'
    }

    const result = await updateFeature({ withinConnection }, updatedFeature)
    assertThat(result.get(), hasProperties(updatedFeature))
  }))
})

describe('setFeatureTags', () => {
  it('adds tagto feature', t(async ({ withinConnection }) => {
    const feature = (await createFeature({ withinConnection }, {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description'
    })).get()

    await assertDifference({ withinConnection }, 'tag_for_feature', 1, async () => {
      await setFeatureTags({ withinConnection }, {
        featureId: feature.id,
        tags: [{
          id: uuid(),
          name: 'bug',
          color: '#ff00ff'
        }]
      })
    })
  }))

  it('removes tag when not provided', t(async ({ withinConnection }) => {
    const feature = (await createFeature({ withinConnection }, {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description'
    })).get()

    await setFeatureTags({ withinConnection }, {
      featureId: feature.id,
      tags: [{
        id: uuid(),
        name: 'bug',
        color: '#ff00ff'
      }]
    })

    await assertDifference({ withinConnection }, 'tag_for_feature', -1, async () => {
      await setFeatureTags({ withinConnection }, {
        featureId: feature.id,
        tags: []
      })
    })
  }))
})

describe('ensureTags', () => {
  it('adds tags', t(({ withinConnection, client }) => {
    return assertDifference({ withinConnection }, 'tag', 1, async () => {
      await ensureTags({ client }, { tags: [{
        id: uuid(),
        name: 'A new feature',
        color: '#ff00ff'
      }] })
    })
  }))

  it('does not recreate existing tag', t(async ({ withinConnection, client }) => {
    const tag = {
      id: uuid(),
      name: 'A new feature',
      color: '#ff00ff'
    }

    return assertDifference({ withinConnection }, 'tag', 1, async () => {
      await ensureTags({ client }, { tags: [tag, tag] })
    })
  }))
})