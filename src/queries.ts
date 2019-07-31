import { UnboundQueries } from './lib/types'
import { AllQueries } from './domain'

export const queries: UnboundQueries<AllQueries> = {
  titles: async (client) => {
    const result = await client.query(`select * from titles`)
    return result.rows.map((row) => {
      if (row.userId) {
        return {
          ...row,
          kind: 'unverified'
        }
      } else {
        return {
          id: row.id,
          name: row.name,
          kind: 'verified'
        }
      }
    })
  },
  users: async (client) => {
    const users = (await client.query(`select * from users`)).rows
    return users.map((user) => {
      return { ...user, title: user.title ? user.title.join(',') : null }
    })
  }
}
