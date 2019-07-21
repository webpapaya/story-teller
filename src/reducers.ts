import { UnboundReducers } from './lib/types';
import { AllEvents, AllQueries, UnverifiedTitle, VerifiedTitle, User } from './domain'

export const reducers:UnboundReducers<AllEvents> = {
  users: async (event, client) => {
    switch (event.type) {
      case 'user/created':
        await client.query({
          text: `
            insert into Users (id, name)
            VALUES ($1, $2)
          `,
          values: [event.payload.id, event.payload.name]
        }); break;
      case 'user/updated':
        await client.query({
          text: `update Users SET name = $2 where id = $1`,
          values: [event.payload.id, event.payload.name]
        }); break;
      case 'user/deleted':
        await client.query({
          text: `delete from Users where id = $1`,
          values: [event.payload.id]
        }); break;
    }
  },
  stamps: async (event, client) => {
    switch (event.type) {
      case 'stamp/created':
          await client.query({
            text: `
              insert into Stamps
              (type, timestamp, location, note)
              VALUES ($1, $2, $3, $4)
            `,
            values: [
              event.payload.type,
              event.payload.timestamp,
              event.payload.location,
              event.payload.note
            ]
          }); break;
    }
  },
  titles: async (event, client) => {
    switch (event.type) {
      case 'title/created':
        await client.query({
          text: `
            insert into Titles (id, name, user_id)
            VALUES ($1, $2, $3)
          `,
          values: [event.payload.id, event.payload.name, event.payload.userId]
        }); break;

      case 'title/notVerified':
        await client.query({
          text: `
            delete from Titles
            where id = $1
          `,
          values: [event.payload.id]
        }); break;

        case 'title/verified':
          const titles = await client.query({
            text: `
              select * from titles
              where id = $1
            `,
            values: [event.payload.id]
          });


          await Promise.all([
            client.query({
              text: `
                update Titles
                set user_id = null
                where id = $1
              `,
              values: [event.payload.id]
            }),
            client.query({
              text: `
                update Users
                set title = '${JSON.stringify(titles.rows.map((title) => title.name))}'
                where id = $1
              `,
              values: [titles.rows[0].userId]
            }),
          ]);
          break;

    }
  },
}

export const queries:AllQueries = {
  titles: async (client) => {
    const result = await client.query(`select * from titles`)
    return result.rows.map((row) => {
      if(row.userId) {
        return {
          ...row,
          kind: 'unverified'
        } as UnverifiedTitle
      } else {
        return {
          id: row.id,
          name: row.name,
          kind: 'verified'
        } as VerifiedTitle
      }
    });
  },
  users: async (client) => {
    const users = (await client.query(`select * from users`)).rows
    return users.map((user) => {
      return { ...user, title: user.title ? user.title.join(',') : null }
    });
  }
}