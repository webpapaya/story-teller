import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { LocalDateTime, nativeJs } from 'js-joda'
import { v } from '@story-teller/shared'
import { aggregateFactory, useCase } from '../lib/use-case'

const SALT_ROUNDS = process.env.NODE_ENV === 'test' ? 1 : 10

export const hashPassword = (password: string) =>
  bcrypt.hashSync(password, SALT_ROUNDS)

export const comparePassword = (password: string, passwordHash: any) =>
  passwordHash && bcrypt.compareSync(password, passwordHash)

export const buildToken = (createdAt = LocalDateTime.now()) => {
  const plainToken = crypto.randomBytes(50).toString('hex')
  const token = hashPassword(plainToken)

  return {
    state: 'active' as const,
    plainToken,
    token,
    createdAt,
  }
}

const todo = v.nonEmptyString
const userAggregateRoot = v.uuid

const token = v.union([
  v.valueObject({
    state: v.literal('inactive'),
    usedAt: v.localDateTime,
  }),
  v.valueObject({
    state: v.literal('active'),
    token: todo,
    plainToken: v.option(todo),
    createdAt: v.localDateTime,
  }),
])

export const userAuthentication = v.aggregate({
  id: userAggregateRoot,
  userIdentifier: todo,
  createdAt: v.localDateTime,
  confirmation: token,
  passwordReset: token,
  password: todo,
})
export type UserAuthentication = typeof userAuthentication['O']

const authenticationToken = v.aggregate({
  id: v.uuid,
  userId: userAggregateRoot,
  token: token,
})
export type AuthenticationToken = typeof authenticationToken['O']

export const register = aggregateFactory({
  aggregateFrom: v.undefinedCodec,
  aggregateTo: userAuthentication,
  command: v.record({
    id: v.uuid,
    userIdentifier: todo,
    password: todo,
  }),
  events: [
    // TODO: send event for email sending
  ],
  execute: ({ command }) => {
    const passwordHash = hashPassword(command.password)
    const now = LocalDateTime.now()

    return {
      id: command.id,
      userIdentifier: command.userIdentifier,
      password: passwordHash,
      createdAt: now,
      confirmation: buildToken(now),
      passwordReset: {
        state: 'inactive' as const,
        usedAt: now,
      },
    }
  }
})

export const confirmAccount = useCase({
  aggregate: userAuthentication,
  command: v.record({ id: v.uuid, token: todo }),
  events: [],
  preCondition: ({ aggregate }) => aggregate.confirmation.state === 'active',
  execute: ({ command, aggregate }) => {
    if (
      aggregate.confirmation.state !== 'active' ||
      !comparePassword(command.token, aggregate.confirmation.token)) {
      // TODO: think about proper exceptions
      throw new Error('Tokens didn\'t match')
    }
    const now = LocalDateTime.now()
    return {
      ...aggregate,
      confirmation: {
        state: 'inactive' as const,
        usedAt: now
      }
    }
  }
})

export const requestPasswordReset = useCase({
  aggregate: userAuthentication,
  command: v.record({ id: v.uuid }),
  events: [
    // TODO: send password reset email
  ],
  execute: ({ aggregate }) => {
    return {
      ...aggregate,
      passwordReset: buildToken()
    }
  }
})

export const resetPasswordByToken = useCase({
  aggregate: userAuthentication,
  command: v.record({ id: v.uuid, token: todo, password: todo }),
  events: [
    // TODO: send password reset email
  ],
  execute: ({ aggregate, command }) => {
    if (
      aggregate.passwordReset.state !== 'active' ||
      !comparePassword(command.token, aggregate.passwordReset.token)) {
      // TODO: think about proper exceptions
      throw new Error('Tokens didn\'t match')
    }

    const isTokenToOld = LocalDateTime.from(nativeJs(new Date()))
      .minusDays(1)
      .plusSeconds(1)
      .isAfter(aggregate.passwordReset.createdAt)

    if (isTokenToOld) {
      // TODO: think about proper exceptions
      throw new Error('Tokens is too old')
    }

    return {
      ...aggregate,
      password: hashPassword(command.password),
      passwordReset: {
        state: 'inactive' as const,
        usedAt: LocalDateTime.now(),
      }
    }
  }
})

export const createToken = aggregateFactory({
  aggregateFrom: userAuthentication,
  aggregateTo: authenticationToken,
  command: v.record({ id: v.uuid, userId: v.uuid, password: todo }),
  events: [
    // TODO: send password reset email
  ],
  execute: ({ aggregate, command }) => {
    if (!comparePassword(command.password, aggregate.password)) {
      // TODO: think about proper exceptions
      throw new Error('Password didn\'t match')
    }

    return {
      id: command.id,
      userId: command.userId,
      token: buildToken()
    }
  }
})

export const refreshToken = useCase({
  aggregate: authenticationToken,
  command: v.record({ id: v.uuid, userId: v.uuid, token: todo }),
  events: [
    // TODO: send password reset email
  ],
  execute: ({ aggregate, command }) => {
    if (aggregate.token.state !== 'active' ||
      !comparePassword(command.token, aggregate.token.token)) {
      // TODO: think about proper exceptions
      throw new Error('Token didn\'t match')
    }

    return {
      id: command.id,
      userId: command.userId,
      token: buildToken()
    }
  }
})