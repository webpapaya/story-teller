import * as v from 'validation.ts'

type HTTPVerb = 'get' | 'post' | 'patch' | 'delete'
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

export const SESSION_COMMAND = buildCommandDefinition({
  verb: 'get',
  model: 'user',
  action: 'session',
  validator: v.object({}),
  response: v.object({
    id: uuid,
    userIdentifier: nonEmptyString
  })
})

export const SIGN_UP_COMMAND = buildCommandDefinition({
  verb: 'post',
  action: 'sign-up',
  model: 'user',
  validator: v.object({
    userIdentifier: nonEmptyString,
    password: nonEmptyString
  }),
  response: undefined
})

export const REQUEST_PASSWORD_RESET_COMMAND = buildCommandDefinition({
  verb: 'post',
  action: 'request-password-reset',
  model: 'user',
  validator: v.object({
    userIdentifier: nonEmptyString
  }),
  response: v.object({})
})

export const RESET_PASSWORD_BY_TOKEN_COMMAND = buildCommandDefinition({
  verb: 'post',
  action: 'reset-password-by-token',
  model: 'user',
  validator: v.object({
    userIdentifier: nonEmptyString,
    password: nonEmptyString,
    token: nonEmptyString
  }),
  response: undefined
})

export const SIGN_IN_COMMAND = buildCommandDefinition({
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
})

export const SIGN_OUT_COMMAND = buildCommandDefinition({
  verb: 'post',
  model: 'user',
  action: 'sign-out',
  validator: v.object({}),
  response: v.object({}),
})

// Features
const FEATURE_AGGREGATE = v.object({
  id: uuid,
  title: nonEmptyString,
  description: nonEmptyString,

  // deprecated
  originalId: uuid,
  version: v.number
})

export const CREATE_FEATURE_COMMAND = buildCommandDefinition({
  verb: 'post',
  action: 'create',
  model: 'feature',
  validator: v.object({
    id: uuid,
    title: nonEmptyString,
    description: nonEmptyString
  }),
  response: FEATURE_AGGREGATE
})

export const CREATE_FEATURE_REVISION_COMMAND = buildCommandDefinition({
  verb: 'post',
  action: 'create-revision',
  model: 'feature',
  validator: v.object({
    id: uuid,
    title: nonEmptyString,
    description: nonEmptyString,
    originalId: uuid
  }),
  response: FEATURE_AGGREGATE
})

export const LIST_FEATURES_COMMAND = buildCommandDefinition({
  verb: 'get',
  action: 'fetch',
  model: 'feature',
  validator: v.object({}),
  response: v.array(FEATURE_AGGREGATE)
})

export const LIST_FEATURE_REVISIONS_COMMAND = buildCommandDefinition({
  verb: 'get',
  action: 'fetch',
  model: 'feature-revision',
  validator: v.object({ id: uuid }),
  response: v.array(FEATURE_AGGREGATE)
})

// Revisions
const REVISION_AGGREGATE = v.object({
  id: uuid,
  reason: v.string,
  featureId: uuid,
  version: v.number
})

export const LIST_REVISIONS_COMMAND = buildCommandDefinition({
  verb: 'get',
  action: 'fetch',
  model: 'revision',
  validator: v.object({ featureId: uuid }),
  response: v.array(REVISION_AGGREGATE)
})

export const CREATE_REVISION_COMMAND = buildCommandDefinition({
  verb: 'post',
  action: 'create',
  model: 'revision',
  validator: v.object({
    id: uuid,
    feature: FEATURE_AGGREGATE
  }),
  response: v.array(REVISION_AGGREGATE)
})