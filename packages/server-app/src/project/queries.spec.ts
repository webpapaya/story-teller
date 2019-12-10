// @ts-ignore
import { assertThat, hasProperties } from 'hamjest'
import uuid from 'uuid'
import { t } from '../spec-helpers'
import { projectFactory } from './factories'
import { create as createUser, userAuthenticationFactory } from '../authentication/factories'
import { createProject } from './commands'
import { queryProject, queryContributors } from './queries'

describe('queryProject', () => {
  it('returns a valid object', t(async ({ withinConnection, client }) => {
    const user = await createUser({ client }, userAuthenticationFactory.build())
    const project = (await createProject({ client }, {
      ...projectFactory.build(),
      userId: user.id
    })).get()

    const result = await queryProject({ client }, { userId: user.id })

    assertThat(result.get(), hasProperties({
      length: 1,
      0: hasProperties({ id: project.id })
    }))
  }))

  it('returns empty result when not a member in a project', t(async ({ withinConnection, client }) => {
    const user = await createUser({ client }, userAuthenticationFactory.build())
    const project = (await createProject({ client }, {
      ...projectFactory.build(),
      userId: user.id
    })).get()

    const result = await queryProject({ client }, { userId: uuid() })
    assertThat(result.get(), hasProperties({ length: 0 }))
  }))
})

describe('queryContributors', () => {
  it('returns a valid object', t(async ({ withinConnection, client }) => {
    const user = await createUser({ client }, userAuthenticationFactory.build())
    const project = (await createProject({ client }, {
      ...projectFactory.build(),
      userId: user.id
    })).get()

    const result = await queryContributors({ client }, { projectId: project.id })

    assertThat(result.get(), hasProperties({
      length: 1,
      0: hasProperties({
        projectId: project.id,
        userId: user.id,
        name: user.userIdentifier
      })
    }))
  }))
})