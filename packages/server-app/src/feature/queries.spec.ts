// @ts-ignore
import { assertThat, hasProperty, equalTo } from 'hamjest'
import { t } from '../spec-helpers'
import uuid from 'uuid'
import { createFeature } from './commands'
import { whereFeature } from './queries'

describe('feature queries', () => {
  it('finds queries in a db', t(async ({ withinConnection }) => {
    const feature = {
      id: uuid(),
      title: 'A new feature',
      description: 'A feature description'
    }

    await createFeature({ withinConnection }, feature)

    assertThat(await whereFeature({ withinConnection }),
      hasProperty('body', equalTo([feature])))
  }))
})
