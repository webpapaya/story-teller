import { v } from '@story-teller/shared'
import { buildEvent } from '../lib/events'
import { email } from '../utils/custom-codecs'

export const todo = v.nonEmptyString
export const userAggregateRoot = v.uuid
export const userIdentifier = v.nonEmptyString
export const password = v.clampedString(4, 255)
export const plainToken = v.nonEmptyString

const token = v.union([
  v.valueObject({
    state: v.literal('inactive'),
    usedAt: v.localDateTime
  }),
  v.valueObject({
    state: v.literal('active'),
    token: todo,
    plainToken: v.option(todo),
    createdAt: v.localDateTime
  })
])

export const userAuthentication = v.aggregate({
  id: userAggregateRoot,
  userIdentifier: email,
  createdAt: v.localDateTime,
  confirmation: token,
  passwordReset: token,
  password: todo
})
export type UserAuthentication = typeof userAuthentication['O']

export const authenticationToken = v.aggregate({
  id: v.uuid,
  userId: userAggregateRoot,
  token: token,
  expiresOn: v.localDateTime
})
export type AuthenticationToken = typeof authenticationToken['O']

export const principal = v.record({
  id: v.uuid,
  employedIn: v.array(v.record({
    companyId: v.uuid,
    role: v.union([v.literal('employee'), v.literal('manager')])
  }))
})

export type Principal = typeof principal['O']

export const events = {
  userRegistered: buildEvent('userRegistered', v.record({
    userAuthentication
  })),
  passwordResetRequested: buildEvent('passwordResetRequested', v.record({
    userAuthentication
  }))
} as const
