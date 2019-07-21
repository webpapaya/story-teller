import sql from "sql-template-tag";
import { UnboundReducers } from './lib/types';
import { AllEvents, AllQueries, UnverifiedTitle, VerifiedTitle } from './domain'

export const reducers:UnboundReducers<AllEvents> = {
  users: async (event, client) => {
    switch (event.type) {
      case 'user/created':
        await client.query(sql`
          INSERT INTO Users (id, name)
          VALUES (${event.payload.id}, ${event.payload.name})
        `); break;
      case 'user/updated':
        await client.query(sql`
          UPDATE Users SET name = ${event.payload.name}
          where id = ${event.payload.id}
        `); break;
      case 'user/deleted':
        await client.query(sql`
          DELETE from Users
          where id = ${event.payload.id}
        `); break;
    }
  },
  stamps: async (event, client) => {
    switch (event.type) {
      case 'stamp/created':
          await client.query(sql`
            INSERT INTO Stamps
            (type, timestamp, location, note)
            VALUES (
              ${event.payload.type},
              ${event.payload.timestamp},
              ${event.payload.location},
              ${event.payload.note}
            )
          `); break;
    }
  },
  titles: async (event, client) => {
    switch (event.type) {
      case 'title/created':
        await client.query(sql`
            INSERT INTO Titles (id, name, user_id)
            VALUES (${event.payload.id}, ${event.payload.name}, ${event.payload.userId})
        `); break;
      case 'title/notVerified':
        await client.query(sql`
          DELETE from Titles
          where id = ${event.payload.id}
        `); break;
        case 'title/verified':
          const titles = await client.query(sql`
            select * from titles
            where id = ${event.payload.id}
          `);

          await Promise.all([
            client.query(`
              UPDATE Titles
              set user_id = null
              where id = ${event.payload.id}
            `),
            client.query(sql`
              UPDATE Users
              set title = ${JSON.stringify(titles.rows.map((title) => title.name))}::JSONB
              where id = ${titles.rows[0].userId}
            `),
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