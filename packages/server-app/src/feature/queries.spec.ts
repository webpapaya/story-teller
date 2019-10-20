// @ts-ignore
import { assertThat, hasProperty, equalTo } from 'hamjest'
import { t } from '../spec-helpers'
import uuid from 'uuid'
import { createFeature, createFeatureRevision } from './commands'
import { whereFeature } from './queries'

describe('feature queries', () => {
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
      hasProperty('body', equalTo([feature])))
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
      hasProperty('body', equalTo([revision])))
  }))
})
