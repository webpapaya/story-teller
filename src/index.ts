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

type AllEvents =
  | SingleEvent<'user/created', User>
  | SingleEvent<'user/updated', User>
  | SingleEvent<'user/deleted', Pick<User, 'id'>>

type InternalEvent = { id: EventId } & AllEvents;

type Events = AllEvents[]
type State = {
  users: User[]
}

const reducer = async (event:InternalEvent, client:DBClient): Promise<void> => {
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

  return { publish, read };
}