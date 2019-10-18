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

export const SESSION_DEFINITION = buildCommandDefinition({
  verb: 'get',
  model: 'user',
  action: 'session',
  validator: v.object({}),
  response: v.object({
    id: v.string,
    userIdentifier: v.string
  })
})

export const SIGN_UP_DEFINITION = buildCommandDefinition({
  verb: 'post',
  action: 'sign-up',
  model: 'user',
  validator: v.object({
    userIdentifier: v.string,
    password: v.string
  }),
  response: undefined
})

export const REQUEST_PASSWORD_RESET_DEFINITION = buildCommandDefinition({
  verb: 'post',
  action: 'request-password-reset',
  model: 'user',
  validator: v.object({
    userIdentifier: v.string
  }),
  response: v.object({})
})

export const RESET_PASSWORD_BY_TOKEN_DEFINITION = buildCommandDefinition({
  verb: 'post',
  action: 'reset-password-by-token',
  model: 'user',
  validator: v.object({
    userIdentifier: v.string,
    password: v.string,
    token: v.string
  }),
  response: undefined
})

export const SIGN_IN_DEFINITION = buildCommandDefinition({
  verb: 'post',
  action: 'sign-in',
  model: 'user',
  validator: v.object({
    userIdentifier: v.string,
    password: v.string
  }),
  response: v.object({
    id: v.string,
    userIdentifier: v.string
  })
})

export const SIGN_OUT_DEFINITION = buildCommandDefinition({
  verb: 'post',
  model: 'user',
  action: 'sign-out',
  validator: v.object({}),
  response: undefined
})

export const CREATE_FEATURE_DEFINITION = buildCommandDefinition({
  verb: 'post',
  action: 'create',
  model: 'feature',
  validator: v.object({
    id: v.string,
    title: v.string,
    description: v.string
  }),
  response: undefined
})

export const LIST_FEATURES_DEFINITION = buildCommandDefinition({
  verb: 'get',
  action: 'fetch',
  model: 'feature',
  validator: v.object({}),
  response: v.array(v.object({
    id: v.string,
    title: v.string,
    description: v.string
  }))
})