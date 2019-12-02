import { AnyCodec, Validation, Ok, Err } from './types'
import { record, string, matchesRegex, array, number } from './primitives'

type HTTPVerb = 'get' | 'post' | 'patch' | 'delete' | 'put'
export type CommandDefinition<
  A extends AnyCodec,
  B extends AnyCodec
> = {
  verb: HTTPVerb
  action?: string
  model: string
  validator: A
  response: B | undefined
}

export const buildCommandDefinition = <
  A extends AnyCodec,
  B extends AnyCodec
>(definition: CommandDefinition<A, B>) => definition

const clampedString = (minLength: number, maxLength: number) => new Validation<string>(
  `clampedString(min: ${minLength}, max: ${maxLength})`,
  (input, context) => {
    return typeof input === 'string' && input.length >= minLength && input.length <= maxLength
      ? Ok(input)
      : Err([{ message: `can't be longer than ${maxLength} chars`, context }])
  }
)

const nonEmptyString = clampedString(1, Number.POSITIVE_INFINITY)
const color = matchesRegex('color', /^#[0-9A-F]{6}$/i)
const uuid = matchesRegex('uuid', /^#[0-9A-F]{6}$/i)

export namespace Authentication {
  export const aggregate = record({})

  export const actions = {
    signOut: buildCommandDefinition({
      verb: 'post',
      model: 'user',
      action: 'sign-out',
      validator: record({}),
      response: record({})
    }),

    signIn: buildCommandDefinition({
      verb: 'post',
      action: 'sign-in',
      model: 'user',
      validator: record({
        userIdentifier: nonEmptyString,
        password: nonEmptyString
      }),
      response: record({
        id: uuid,
        userIdentifier: nonEmptyString
      })
    }),

    signUp: buildCommandDefinition({
      verb: 'post',
      action: 'sign-up',
      model: 'user',
      validator: record({
        userIdentifier: nonEmptyString,
        password: nonEmptyString
      }),
      response: record({})
    }),

    resetPasswordByToken: buildCommandDefinition({
      verb: 'post',
      action: 'reset-password-by-token',
      model: 'user',
      validator: record({
        userIdentifier: nonEmptyString,
        password: nonEmptyString,
        token: nonEmptyString
      }),
      response: record({})
    }),

    requestPasswordReset: buildCommandDefinition({
      verb: 'post',
      action: 'request-password-reset',
      model: 'user',
      validator: record({
        userIdentifier: nonEmptyString
      }),
      response: record({})
    })
  }

  export const queries = {
    session: buildCommandDefinition({
      verb: 'get',
      model: 'user',
      action: 'session',
      validator: record({}),
      response: record({
        id: uuid,
        userIdentifier: nonEmptyString
      })
    })
  }
}

export namespace Tags {
  export const aggregate = record({
    id: uuid,
    name: nonEmptyString,
    color: color
  })

  export const queries = {
    where: buildCommandDefinition({
      verb: 'get',
      model: 'tag',
      action: 'fetch',
      validator: record({}),
      response: array(aggregate)
    })
  }
}

export namespace Feature {
  export const aggregate = record({
    id: uuid,
    title: nonEmptyString,
    description: nonEmptyString,
    originalId: uuid,
    version: number,
    tags: array(record({
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
      validator: record({
        id: uuid,
        title: nonEmptyString,
        description: nonEmptyString
      }),
      response: record({})
    }),

    update: buildCommandDefinition({
      verb: 'put',
      action: 'update',
      model: 'feature',
      validator: record({
        id: uuid,
        title: nonEmptyString,
        description: nonEmptyString,
        originalId: uuid,
        reason: nonEmptyString
      }),
      response: record({})
    }),
    setTags: buildCommandDefinition({
      verb: 'put',
      action: 'set-tags',
      model: 'feature',
      validator: record({
        featureId: uuid,
        tags: array(Tags.aggregate)
      }),
      response: record({})
    })
  }

  export const queries = {
    where: buildCommandDefinition({
      verb: 'get',
      action: 'fetch',
      model: 'feature',
      validator: record({}),
      response: array(aggregate)
    })
  }
}

export namespace Revision {
  export const aggregate = record({
    id: uuid,
    reason: string,
    featureId: uuid,
    version: number
  })

  export const actions = {}

  export const queries = {
    where: buildCommandDefinition({
      verb: 'get',
      action: 'fetch',
      model: 'revision',
      validator: record({ featureId: uuid }),
      response: array(aggregate)
    })
  }
}
