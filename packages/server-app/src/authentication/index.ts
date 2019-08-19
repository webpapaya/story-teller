import { WithinConnection } from '../lib/db'
import bcrypt from 'bcrypt'
import sql from 'sql-template-tag'

type Register = (
  deps: { withinConnection: WithinConnection },
  params: { userIdentifer: string, password: string}
) => Promise<void>

type ValidatePassword = (
  deps: { withinConnection: WithinConnection },
  params: { userIdentifer: string, password: string}
) => Promise<boolean>

const SALT_ROUNDS = 10
export const hashPassword = async (password: string) =>
  bcrypt.hash(password, SALT_ROUNDS)

export const comparePassword = async (password:string, passwordHash:string) =>
  bcrypt.compare(password, passwordHash)

export const validatePassword: ValidatePassword = async (dependencies, params)  => {
  return dependencies.withinConnection(async ({ client }) => {
    const result = await client.query(sql`
      select * from user_authentication
      where user_identifier = ${params.userIdentifer}
    `)

    for (let user of result.rows) {
      if (await comparePassword(params.password, user.password)) {
        return true
      }
    }
    return false
  })
}

export const register: Register = async (dependencies, params)  => {
  return dependencies.withinConnection(async ({client}) => {
    const passwordHash = await hashPassword(params.password)
    await client.query(sql`
      insert into user_authentication (user_identifier, password)
      values (${params.userIdentifer}, ${passwordHash})
    `)
  })
}
