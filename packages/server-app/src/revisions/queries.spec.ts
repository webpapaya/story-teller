
// @ts-ignore
import { assertThat, hasProperties, instanceOf, equalTo } from 'hamjest'
import { t } from '../spec-helpers'
import uuid from 'uuid'
import { updateFeature, createFeature } from '../feature/commands'
import { whereRevision } from './queries'
import { LocalDateTime } from 'js-joda'

describe('whereFeature', () => {
  it('finds queries in a db', t(async ({ client }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description'
    }

    const revision = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description',
      originalId: feature.id,
      reason: 'Fixed typo'
    }

    await createFeature({ client }, feature)
    await updateFeature({ client }, revision)

    const features = await whereRevision({ client }, { featureId: feature.id })

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

  it('returns features for featureId only', t(async ({ client }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description'
    }

    await createFeature({ client }, feature)

    const features = await whereRevision({ client }, { featureId: uuid() })

    assertThat(features.get(), equalTo([]))
  }))
})
