import QueryStream from 'pg-query-stream';
import { withinTransaction, WithinConnection, DBClient } from './db';

type EventId = string;
export type SingleEvent<Type, Payload> = {
  type: Type,
  payload: Payload,
}

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
  timestamp: string
  location?: string
  note?: string
}

type AllEvents =
  | SingleEvent<'stamp/created', Stamp>
  | SingleEvent<'user/created', User>
  | SingleEvent<'user/updated', User>
  | SingleEvent<'user/deleted', Pick<User, 'id'>>

type InternalEvent = { id: EventId } & AllEvents;

type Events = AllEvents[]
type State = {
  users: User[]
}

const reducer = async (event:InternalEvent, client:DBClient, replay: boolean = false): Promise<void> => {
  switch (event.type) {
    case 'user/created':
      await client.query({
        text: `
          insert into Users${replay ? '_Copy' : '' } (id, name)
          VALUES ($1, $2)
        `,
        values: [event.payload.id, event.payload.name]
      }); break;
    case 'user/updated':
      await client.query({
        text: `update Users${replay ? '_Copy' : '' } SET name = $2 where id = $1`,
        values: [event.payload.id, event.payload.name]
      }); break;
    case 'user/deleted':
      await client.query({
        text: `delete from Users${replay ? '_Copy' : '' } where id = $1`,
        values: [event.payload.id]
      }); break;
    case 'stamp/created':
        await client.query({
          text: `
            insert into Stamps${replay ? '_Copy' : '' }
            (id, type, timestamp, location, note)
            VALUES ($1, $2, $3, $4, $5)
          `,
          values: [
            event.payload.id,
            event.payload.type,
            event.payload.timestamp,
            event.payload.location,
            event.payload.note
          ]
        }); break;
  }

  return Promise.resolve();
}

const insertEvent = async (client: DBClient, event: AllEvents) => {
  const result = await client.query(`
    INSERT INTO events (type, payload)
    VALUES ('${event.type}', '${JSON.stringify(event.payload)}')
    RETURNING *;
  `);
  return result.rows[0] as InternalEvent;
}



export const createApp = (withinConnection: WithinConnection = withinTransaction) => {
  const state: State = { users: [] }
  const publish = async (event:AllEvents): Promise<EventId> => {
    return withinConnection(async ({ client }) => {
      const internalEvent = await insertEvent(client, event);
      await reducer(internalEvent, client)
      return internalEvent.id;
    });
  }



  const read = () => state;
  const rebuildAggregates = () => {
    return withinConnection(async ({ client }) => {
      client.query(`
        CREATE TABLE Users_Copy AS
        TABLE Users
        WITH NO DATA;
      `);
      await new Promise((resolve) => {
        const query = new QueryStream('SELECT * FROM events');
        const stream = client.query(query);
        stream.on('data', (event) => {
          reducer(event as InternalEvent, client, true)
        })
        stream.on('end', resolve)
      });

      await client.query(`ALTER TABLE Users RENAME TO Users_Deleted`);
      await client.query(`ALTER TABLE Users_Copy RENAME TO Users`);
      await client.query(`DROP TABLE Users_Deleted`);
    });
  };

  return { publish, read, rebuildAggregates };
}