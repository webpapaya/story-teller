import { UnboundReducers } from './lib/types';
import { AllEvents } from './domain'

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
  }
}