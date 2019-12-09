// @ts-ignore
import { assertThat, equalTo } from 'hamjest'
import { t, assertDifference } from '../spec-helpers'
import uuid from 'uuid'
import { createProject } from './commands'
import { Project } from '@story-teller/shared'

describe('createProject', () => {
  it('creates a new record', t(async ({ withinConnection }) => {
    return assertDifference({ withinConnection }, 'project', 1, async () => {
      await createProject({ withinConnection }, {
        id: uuid(),
        name: 'A new project',
      })
    })
  }))

  it('returns a valid project object', t(async ({ withinConnection }) => {
    assertThat(Project.aggregate.is((await createProject({ withinConnection }, {
      id: uuid(),
      name: 'A new project',
    })).get()), equalTo(true))
  }))

  it('upserts record when it already exists', t(async ({ withinConnection }) => {
    const project = {
      id: uuid(),
      name: 'A new project',
    }

    await createProject({ withinConnection }, project)
    return assertDifference({ withinConnection }, 'project', 0, async () => {
      await createProject({ withinConnection }, project)
    })
  }))
})