import * as Factory from 'factory.ts'
import { LocalDateTime, nativeJs } from 'js-joda'
import snakeCase from 'snake-case'
import { WithinConnection } from '../lib/db'

type UserAuthentication = {
  userIdentifier: string
  createdAt: LocalDateTime
  confirmationToken: string | null
  confirmedAt: LocalDateTime | null
  password: string
  passwordResetToken: string | null
  passwordResetSentAt: LocalDateTime | null
}

export const DUMMY_TOKEN = '0fb339b556d1a822f68785bff7e67362e235563d'
const DUMMY_TOKEN_HASHED = '$2b$04$he9DIvynmp4Xj4LZ.tvbsu5Xm/qq.RY5wNpGVsiKhfSlaa.yQn6Ka'

export const requestedPasswordReset = {
  passwordResetToken: DUMMY_TOKEN_HASHED,
  passwordResetSentAt: LocalDateTime.from(nativeJs(new Date()))
}

export const unconfirmed = {
  confirmationToken: DUMMY_TOKEN_HASHED
}

export const userAuthenticationFactory = Factory.Sync.makeFactory<UserAuthentication>({
  userIdentifier: 'sepp',
  createdAt: Factory.each(() => LocalDateTime.from(nativeJs(new Date()))),
  confirmationToken: null,
  confirmedAt: null,
  password: '1234',
  passwordResetToken: null,
  passwordResetSentAt: null
})

export const create = async (dependencies: { withinConnection: WithinConnection }, factory: UserAuthentication) => {
  return dependencies.withinConnection(async ({ client }) => {
    const keys = Object.keys(factory)
    // @ts-ignore
    const values = keys.map((key) => factory[key])
    await client.query(`
      INSERT INTO user_authentication (${keys.map((v) => snakeCase(v)).join(', ')})
      VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')})
    `, values)

    return factory
  })
}