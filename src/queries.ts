import { UnboundQueries } from './lib/types'
import { AllQueries, UnverifiedTitle, VerifiedTitle } from './domain'

export const queries: UnboundQueries<AllQueries> = {
  titles: async (client) => {
    const result = await client.query(`select * from titles`)
    return result.rows.map((row) => {
      if (row.userId) {
        return {
          ...row,
          kind: 'unverified'
        } as unknown as UnverifiedTitle
      } else {
        return {
          id: row.id,
          name: row.name,
          kind: 'verified'
        } as unknown as VerifiedTitle
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
