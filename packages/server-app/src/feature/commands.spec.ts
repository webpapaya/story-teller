import { t, assertDifference } from '../spec-helpers'
import uuid from 'uuid'
import { createFeature } from './commands'

describe('feature', () => {
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
