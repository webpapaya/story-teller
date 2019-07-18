import { Omit, SingleEvent, UnboundReducers } from './types';
import { ZonedDateTime } from 'js-joda';

export type User = {
  id: number,
  name: string
}

type StampTypes =
  | 'Start'
  | 'Break'
  | 'Stop'

export type Stamp = {
  id: number
  type: StampTypes
  timestamp: ZonedDateTime,
  location?: string
  note?: string
}

export type AllEvents =
  | SingleEvent<'stamp/created', Omit<Stamp, 'id'>>
  | SingleEvent<'user/created', User>
  | SingleEvent<'user/updated', User>
  | SingleEvent<'user/deleted', Pick<User, 'id'>>

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