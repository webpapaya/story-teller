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

export const SESSION_DEFINITION = buildCommandDefinition({
  verb: 'get',
  model: 'user',
  action: 'session',
  validator: v.object({}),
  response: v.object({
    id: uuid,
    userIdentifier: nonEmptyString
  })
})

export const SIGN_UP_DEFINITION = buildCommandDefinition({
  verb: 'post',
  action: 'sign-up',
  model: 'user',
  validator: v.object({
    userIdentifier: nonEmptyString,
    password: nonEmptyString
  }),
  response: undefined
})

export const REQUEST_PASSWORD_RESET_DEFINITION = buildCommandDefinition({
  verb: 'post',
  action: 'request-password-reset',
  model: 'user',
  validator: v.object({
    userIdentifier: nonEmptyString
  }),
  response: v.object({})
})

export const RESET_PASSWORD_BY_TOKEN_DEFINITION = buildCommandDefinition({
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

export const SIGN_IN_DEFINITION = buildCommandDefinition({
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

export const SIGN_OUT_DEFINITION = buildCommandDefinition({
  verb: 'post',
  model: 'user',
  action: 'sign-out',
  validator: v.object({}),
  response: v.object({}),
})

export const CREATE_FEATURE_DEFINITION = buildCommandDefinition({
  verb: 'post',
  action: 'create',
  model: 'feature',
  validator: v.object({
    id: uuid,
    title: nonEmptyString,
    description: nonEmptyString
  }),
  response: undefined
})

export const CREATE_FEATURE_REVISION_DEFINITION = buildCommandDefinition({
  verb: 'post',
  action: 'create-revision',
  model: 'feature',
  validator: v.object({
    id: uuid,
    title: nonEmptyString,
    description: nonEmptyString,
    previousFeatureId: uuid
  }),
  response: v.object({
    id: uuid,
    title: nonEmptyString,
    description: nonEmptyString,
    previousFeatureId: uuid
  })
})

export const LIST_FEATURES_DEFINITION = buildCommandDefinition({
  verb: 'get',
  action: 'fetch',
  model: 'feature',
  validator: v.object({}),
  response: v.array(v.object({
    id: uuid,
    title: nonEmptyString,
    description: nonEmptyString
  }))
})