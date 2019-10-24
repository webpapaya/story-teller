
// @ts-ignore
import { assertThat, hasProperties, instanceOf, equalTo } from 'hamjest'
import { t } from '../spec-helpers'
import uuid from 'uuid'
import { updateFeature, createFeature } from '../feature/commands'
import { whereRevision } from './queries'
import { LocalDateTime } from 'js-joda'

describe('whereFeature', () => {
  it('finds queries in a db', t(async ({ withinConnection }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description',
    }

    const revision = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description',
      originalId: feature.id,
      reason: 'Fixed typo'
    }

    await createFeature({ withinConnection }, feature)
    await updateFeature({ withinConnection }, revision)

    const features = await whereRevision({ withinConnection }, { featureId: feature.id })

    assertThat(features.get(), hasProperties({
      0: hasProperties({
        id: feature.id,
        featureId: feature.id,
        createdAt: instanceOf(LocalDateTime),
        version: 0
      }),
      1: hasProperties({
        id: revision.id,
        featureId: feature.id,
        createdAt: instanceOf(LocalDateTime),
        version: 1,
        reason: revision.reason
      })
    }))
  }))

  it('returns features for featureId only', t(async ({ withinConnection }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description',
    }

    await createFeature({ withinConnection }, feature)

    const features = await whereRevision({ withinConnection }, { featureId: uuid() })

    assertThat(features.get(), equalTo([]))
  }))
})
