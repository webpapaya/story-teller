import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { LocalDateTime, nativeJs } from 'js-joda'
import { v } from '@story-teller/shared'
import { aggregateFactory, useCase } from '../lib/use-case'
import {
  userAuthentication,
  todo,
  authenticationToken,
  principal,
  events,
} from './domain'
import jsonwebtoken from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'

const SALT_ROUNDS = process.env.NODE_ENV === 'test' ? 1 : 10
const SECRET_KEY_BASE = process.env.SECRET_KEY_BASE as string
const JWT_EXPIRATION = process.env.JWT_EXPIRATION as string

export const hashPassword = (password: string) =>
  bcrypt.hashSync(password, SALT_ROUNDS)

export const comparePassword = (password: string, passwordHash: any) =>
  passwordHash && bcrypt.compareSync(password, passwordHash)

export const buildTokenPair = () => {
  const plainToken = crypto.randomBytes(50).toString('hex')
  const token = hashPassword(plainToken)
  return { plainToken, token }
}

export const buildToken = (createdAt = LocalDateTime.now()) => {
  const { plainToken, token } = buildTokenPair()

  return {
    state: 'active' as const,
    plainToken,
    token,
    createdAt
  }
}

export const signUp = aggregateFactory({
  aggregateFrom: v.undefinedCodec,
  aggregateTo: userAuthentication,
  command: v.record({
    id: v.uuid,
    userIdentifier: todo,
    password: todo
  }),
  events: [
    {
      event: events.userRegistered,
      mapper: ({ aggregateAfter }) => {
        return {
          userAuthentication: aggregateAfter
        }
      }
    }
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
        usedAt: now
      }
    }
  }
})

export const signIn = aggregateFactory({
  aggregateFrom: v.record({
    principal: principal,
    userAuthentication: userAuthentication
  }),
  aggregateTo: v.record({
    jwtToken: v.string,
    refreshToken: authenticationToken
  }),
  command: v.record({
    userIdentifier: todo,
    password: todo
  }),
  events: [],
  execute: ({ command, aggregate }) => {
    if (!comparePassword(command.password, aggregate.userAuthentication.password)) {
      // TODO: think about proper exceptions
      throw new Error('Password didn\'t match')
    }

    return {
      jwtToken: jsonwebtoken.sign(aggregate.principal, SECRET_KEY_BASE, {
        expiresIn: JWT_EXPIRATION
      }),
      refreshToken: {
        id: uuid(),
        userId: aggregate.userAuthentication.id,
        token: buildToken(),
        expiresOn: LocalDateTime.now().plusDays(30)
      }
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
        usedAt: LocalDateTime.now()
      }
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
      token: buildToken(),
      expiresOn: LocalDateTime.now().plusDays(30)
    }
  }
})
