import { UnboundReducers } from './lib/types';
import { AllEvents, AllQueries, UnverifiedTitle, VerifiedTitle, Title } from './domain'
import { DBClient } from './lib/db';

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
            insert into Titles (name, userId)
            VALUES ($1, $2)
          `,
          values: [event.payload.name, event.payload.userId]
        }); break;

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
  }
}