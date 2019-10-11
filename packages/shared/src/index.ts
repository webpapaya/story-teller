import * as v from 'validation.ts'

type HTTPVerb = 'get' | 'post' | 'patch' | 'delete'
type CommandDefinition<A> = {
  verb: HTTPVerb
  name: string
  validator: v.Validator<A>
  response?: v.Validator<unknown>
}

const buildCommandDefinition = <A>(definition: CommandDefinition<A>) => definition

export const SESSION_DEFINITION = buildCommandDefinition({
  verb: 'get',
  name: '/session',
  validator: v.object({}),
  response: v.object({
    id: v.string,
    userIdentifier: v.string
  })
})

export const SIGN_UP_DEFINITION = buildCommandDefinition({
  verb: 'post',
  name: '/sign-up',
  validator: v.object({
    userIdentifier: v.string,
    password: v.string
  })
})

export const REQUEST_PASSWORD_RESET_DEFINITION = buildCommandDefinition({
  verb: 'post',
  name: '/request-password-reset',
  validator: v.object({
    userIdentifier: v.string
  })
})

export const RESET_PASSWORD_BY_TOKEN_DEFINITION = buildCommandDefinition({
  verb: 'post',
  name: '/reset-password-by-token',
  validator: v.object({
    userIdentifier: v.string,
    password: v.string,
    token: v.string
  })
})

export const SIGN_IN_DEFINITION = buildCommandDefinition({
  verb: 'post',
  name: '/sign-in',
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
  name: '/sign-out',
  validator: v.object({})
})

export const CREATE_FEATURE_DEFINITION = buildCommandDefinition({
  verb: 'post',
  name: '/feature',
  validator: v.object({
    id: v.string,
    title: v.string,
    description: v.string
  })
})
