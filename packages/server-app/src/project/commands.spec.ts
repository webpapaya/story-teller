// @ts-ignore
import { assertThat, equalTo } from 'hamjest'
import { t, assertDifference } from '../spec-helpers'
import uuid from 'uuid'
import { createProject, removeContributorFromProject, assignContributorToProject, addFeatureToProject, removeFeatureFromProject } from './commands'
import { Project } from '@story-teller/shared'
import { register } from '../authentication/commands'
import { findUserByIdentifier } from '../authentication/queries'
import { PoolClient } from 'pg'
import { UserAuthentication } from '../domain'
import { createFeature } from '../feature/commands'

let counter = 0
const createUser = async (deps: { client: PoolClient }) => {
  const userIdentifier = `sepp${counter++}`
  await register({ ...deps, sendMail: async () => {} }, {
    userIdentifier,
    password: 'huber'
  })

  return (await findUserByIdentifier(deps, { userIdentifier })).get() as unknown as UserAuthentication
}

describe('createProject', () => {
  it('creates a new record', async () => {
    for (const project of Project.aggregate.build()) {
      await t(async ({ client }) => {
        return assertDifference({ client }, 'project', 1, async () => {
          await createProject({ client }, {
            ...project(),
            userId: (await createUser({ client })).id
          })
        })
      })
    }
  })

  it('assigns contributor to project', t(async ({ client }) => {
    return assertDifference({ client }, 'contributor', 1, async () => {
      await createProject({ client }, {
        id: uuid(),
        name: 'A new project',
        userId: (await createUser({ client })).id
      })
    })
  }))

  it('returns a valid project object', t(async ({ client }) => {
    assertThat(Project.aggregate.is((await createProject({ client }, {
      id: uuid(),
      name: 'A new project',
      userId: (await createUser({ client })).id
    })).get()), equalTo(true))
  }))

  it('upserts record when it already exists', t(async ({ client }) => {
    const project = {
      id: uuid(),
      name: 'A new project',
      userId: (await createUser({ client })).id
    }

    await createProject({ client }, project)
    return assertDifference({ client }, 'project', 0, async () => {
      await createProject({ client }, project)
    })
  }))
})

describe('removeContributor', () => {
  describe('when only one contributor present', () => {
    it('returns correct error code', t(async ({ client }) => {
      const projectId = uuid()
      const userId = (await createUser({ client })).id
      await createProject({ client }, {
        id: projectId,
        name: 'A new project',
        userId
      })
      const result = await removeContributorFromProject({ client }, { userId, projectId })
      assertThat(result.get(), equalTo('AT_LEAST_ONE_CONTRIBUTOR_REQUIRED'))
    }))

    it('AND does not delete contributor', t(async ({ client }) => {
      const projectId = uuid()
      const userId = (await createUser({ client })).id
      await createProject({ client }, {
        id: projectId,
        name: 'A new project',
        userId
      })

      return assertDifference({ client }, 'contributor', 0, async () => {
        return removeContributorFromProject({ client }, { userId, projectId })
      })
    }))
  })

  it('with more than one contributor left, removes record', t(async ({ client }) => {
    const projectId = uuid()
    const contributor1Id = (await createUser({ client })).id
    const contributor2Id = (await createUser({ client })).id
    await createProject({ client }, {
      id: projectId,
      name: 'A new project',
      userId: contributor1Id
    })
    await assignContributorToProject({ client }, { userId: contributor2Id, projectId })
    return assertDifference({ client }, 'contributor', -1, async () => {
      await removeContributorFromProject({ client }, { projectId, userId: contributor2Id })
    })
  }))
})

describe('addFeature', () => {
  it('adds feature to project', t(async ({ client }) => {
    const project = await createProject({ client }, {
      id: uuid(),
      name: 'A new project',
      userId: (await createUser({ client })).id
    })
    const feature = await createFeature({ client }, {
      id: uuid(),
      title: 'A feature',
      description: 'A feature description'
    })

    await assertDifference({ client }, 'project_feature', 1, async () => {
      await addFeatureToProject({ client }, {
        projectId: project.get().id,
        featureId: feature.get().id
      })
    })
  }))

  it('AND add feature is idempotent', t(async ({ client }) => {
    const project = await createProject({ client }, {
      id: uuid(),
      name: 'A new project',
      userId: (await createUser({ client })).id
    })
    const feature = await createFeature({ client }, {
      id: uuid(),
      title: 'A feature',
      description: 'A feature description'
    })

    await assertDifference({ client }, 'project_feature', 1, async () => {
      await addFeatureToProject({ client }, {
        projectId: project.get().id,
        featureId: feature.get().id
      })

      await addFeatureToProject({ client }, {
        projectId: project.get().id,
        featureId: feature.get().id
      })
    })
  }))
})

describe('removeFeatureFromProject', () => {
  it('removes feature from project', t(async ({ client }) => {
    const project = await createProject({ client }, {
      id: uuid(),
      name: 'A new project',
      userId: (await createUser({ client })).id
    })
    const feature = await createFeature({ client }, {
      id: uuid(),
      title: 'A feature',
      description: 'A feature description'
    })

    await addFeatureToProject({ client }, {
      projectId: project.get().id,
      featureId: feature.get().id
    })

    await assertDifference({ client }, 'project_feature', -1, async () => {
      await removeFeatureFromProject({ client }, {
        projectId: project.get().id,
        featureId: feature.get().id
      })
    })
  }))
})
