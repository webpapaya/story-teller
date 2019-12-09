// @ts-ignore
import { assertThat, equalTo } from 'hamjest'
import { t, assertDifference } from '../spec-helpers'
import uuid from 'uuid'
import { createProject } from './commands'
import { Project } from '@story-teller/shared'
import { register } from '../authentication/commands'
import { findUserByIdentifier } from '../authentication/queries'
import { PoolClient } from 'pg'
import { WithinConnection } from '../lib/db'
import { UserAuthentication } from '../domain'

const createUser = async (deps: { withinConnection: WithinConnection, client: PoolClient }) => {
  await register({ ...deps, sendMail: async () => {} }, {
    userIdentifier: 'sepp',
    password: 'huber'
  })

  return (await findUserByIdentifier(deps, { userIdentifier: 'sepp' })).get() as unknown as UserAuthentication
}

describe('createProject', () => {
  it('creates a new record', t(async ({ withinConnection, client }) => {
    return assertDifference({ withinConnection }, 'project', 1, async () => {
      await createProject({ client }, {
        id: uuid(),
        name: 'A new project',
        contributorId: (await createUser({ withinConnection, client })).id
      })
    })
  }))

  it('assigns contributor to project', t(async ({ withinConnection, client }) => {
    return assertDifference({ withinConnection }, 'contributor', 1, async () => {
      await createProject({ client }, {
        id: uuid(),
        name: 'A new project',
        contributorId: (await createUser({ withinConnection, client })).id
      })
    })
  }))

  it('returns a valid project object', t(async ({ withinConnection, client }) => {
    assertThat(Project.aggregate.is((await createProject({ client }, {
      id: uuid(),
      name: 'A new project',
      contributorId: (await createUser({ withinConnection, client })).id
    })).get()), equalTo(true))
  }))

  it('upserts record when it already exists', t(async ({ withinConnection, client }) => {
    const project = {
      id: uuid(),
      name: 'A new project',
      contributorId: (await createUser({ withinConnection, client })).id
    }

    await createProject({ client }, project)
    return assertDifference({ withinConnection }, 'project', 0, async () => {
      await createProject({ client }, project)
    })
  }))
})
