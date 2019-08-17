import sql from 'sql-template-tag'
import { UnboundReducers } from './lib/types'
import { AllEvents } from './domain'

export const reducers: UnboundReducers<AllEvents> = {
  users: async (event, client) => {
    switch (event.type) {
      case 'user/created':
        await client.query(sql`
          INSERT INTO Users (id, name)
          VALUES (${event.payload.id}, ${event.payload.name})
        `); break
      case 'user/updated':
        await client.query(sql`
          UPDATE Users SET name = ${event.payload.name}
          WHERE id = ${event.payload.id}
        `); break
      case 'user/deleted':
        await client.query(sql`
          DELETE from Users
          WHERE id = ${event.payload.id}
        `); break
    }
  },
  stamps: async (event, client) => {
    switch (event.type) {
      case 'stamp/created':
        await client.query(sql`
            INSERT INTO Stamps
            (id, type, timestamp, location, note)
            VALUES (
              ${event.payload.id},
              ${event.payload.type},
              ${event.payload.timestamp},
              ${event.payload.location},
              ${event.payload.note}
            )
          `); break
    }
  },
  titles: async (event, client) => {
    switch (event.type) {
      case 'title/created':
        await client.query(sql`
            INSERT INTO Titles (id, name, user_id)
            VALUES (${event.payload.id}, ${event.payload.name}, ${event.payload.userId})
        `); break
      case 'title/notVerified':
        await client.query(sql`
          DELETE from Titles
          WHERE id = ${event.payload.id}
        `); break
      case 'title/verified':
        const titleRecords = await client.query(sql`
          select * from titles
          WHERE id = ${event.payload.id}
        `)

        const titles = titleRecords.rows.map((title) => title.name)

        await Promise.all([
          client.query(sql`
              UPDATE Titles
              set user_id = null
              WHERE id = ${event.payload.id}
            `),
          client.query(sql`
              UPDATE Users
              set title = ${JSON.stringify(titles)}::JSONB
              WHERE id = ${titleRecords.rows[0].userId}
            `)
        ])

        break
    }
  }
}
