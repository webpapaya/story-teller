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

const userAuthentication = v.aggregate({
  id: userAggregateRoot,
  userIdentifier: todo,
  createdAt: v.localDateTime,
  confirmation: token,
  passwordReset: token,
  password: todo,
})

const authenticationToken = v.aggregate({
  id: v.uuid,
  userId: userAggregateRoot,
  expiresAt: v.localDateTime,
  token: todo,
})

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
    const plainConfirmationToken = crypto.randomBytes(50).toString('hex')
    const confirmationToken = hashPassword(plainConfirmationToken)
    const now = LocalDateTime.now()

    return {
      id: command.id,
      userIdentifier: command.userIdentifier,
      password: passwordHash,
      createdAt: now,
      confirmation: {
        state: 'active' as const,
        token: confirmationToken,
        plainToken: plainConfirmationToken,
        createdAt: now,
      },
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
    const plainConfirmationToken = crypto.randomBytes(50).toString('hex')
    const confirmationToken = hashPassword(plainConfirmationToken)
    const now = LocalDateTime.now()

    return {
      ...aggregate,
      passwordReset: {
        state: 'active' as const,
        token: confirmationToken,
        plainToken: plainConfirmationToken,
        createdAt: now,
      }
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
