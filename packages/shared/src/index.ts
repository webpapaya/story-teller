import * as v from 'validation.ts'

type HTTPVerb = 'get' | 'post' | 'patch' | 'delete' | 'put'
export type CommandDefinition<A, B> = {
  verb: HTTPVerb
  action?: string
  model: string
  validator: v.Validator<A>
  response: B extends object ? v.Validator<B> : undefined
}

export const buildCommandDefinition = <A, B>(definition: CommandDefinition<A, B>) => definition

export const nonEmptyString = v.string.filter((value) => value.length > 0)
export const uuid = v.string.filter((value) =>
  !!value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i))

export const color = v.string
  .filter((str) => /^#[0-9A-F]{6}$/i.test(str))
  .map((str) => str.toUpperCase())

export namespace Authentication {
  export const aggregate = v.object({})

  export const actions = {
    signOut: buildCommandDefinition({
      verb: 'post',
      model: 'user',
      action: 'sign-out',
      validator: v.object({}),
      response: v.object({})
    }),

    signIn: buildCommandDefinition({
      verb: 'post',
      action: 'sign-in',
      model: 'user',
      validator: v.object({
        userIdentifier: nonEmptyString,
        password: nonEmptyString
      }),
      response: v.object({
        id: uuid,
        userIdentifier: nonEmptyString
      })
    }),

    signUp: buildCommandDefinition({
      verb: 'post',
      action: 'sign-up',
      model: 'user',
      validator: v.object({
        userIdentifier: nonEmptyString,
        password: nonEmptyString
      }),
      response: v.object({})
    }),

    resetPasswordByToken: buildCommandDefinition({
      verb: 'post',
      action: 'reset-password-by-token',
      model: 'user',
      validator: v.object({
        userIdentifier: nonEmptyString,
        password: nonEmptyString,
        token: nonEmptyString
      }),
      response: v.object({})
    }),

    requestPasswordReset: buildCommandDefinition({
      verb: 'post',
      action: 'request-password-reset',
      model: 'user',
      validator: v.object({
        userIdentifier: nonEmptyString
      }),
      response: v.object({})
    })
  }

  export const queries = {
    session: buildCommandDefinition({
      verb: 'get',
      model: 'user',
      action: 'session',
      validator: v.object({}),
      response: v.object({
        id: uuid,
        userIdentifier: nonEmptyString
      })
    })
  }
}

export namespace Tags {
  export const aggregate = v.object({
    id: uuid,
    name: nonEmptyString,
    color: color
  })

  export const queries = {
    where: buildCommandDefinition({
      verb: 'get',
      model: 'tag',
      action: 'fetch',
      validator: v.object({}),
      response: v.array(aggregate)
    })
  }
}

export namespace Feature {
  export const aggregate = v.object({
    id: uuid,
    title: nonEmptyString,
    description: nonEmptyString,
    originalId: uuid,
    version: v.number,
    tags: v.array(v.object({
      id: uuid,
      name: nonEmptyString,
      color: color
    }))
  })

  export const actions = {
    create: buildCommandDefinition({
      verb: 'post',
      action: 'create',
      model: 'feature',
      validator: v.object({
        id: uuid,
        title: nonEmptyString,
        description: nonEmptyString
      }),
      response: v.object({})
    }),

    update: buildCommandDefinition({
      verb: 'put',
      action: 'update',
      model: 'feature',
      validator: v.object({
        id: uuid,
        title: nonEmptyString,
        description: nonEmptyString,
        originalId: uuid,
        reason: nonEmptyString
      }),
      response: v.object({})
    }),
    setTags: buildCommandDefinition({
      verb: 'put',
      action: 'set-tags',
      model: 'feature',
      validator: v.object({
        featureId: uuid,
        tags: v.array(Tags.aggregate)
      }),
      response: v.object({})
    })
  }

  export const queries = {
    where: buildCommandDefinition({
      verb: 'get',
      action: 'fetch',
      model: 'feature',
      validator: v.object({}),
      response: v.array(aggregate)
    })
  }
}

export namespace Revision {
  export const aggregate = v.object({
    id: uuid,
    reason: v.string,
    featureId: uuid,
    version: v.number
  })

  export const actions = {}

  export const queries = {
    where: buildCommandDefinition({
      verb: 'get',
      action: 'fetch',
      model: 'revision',
      validator: v.object({ featureId: uuid }),
      response: v.array(aggregate)
    })
  }
}
