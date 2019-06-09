import { withinTransaction, WithinConnection } from './db';
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

const reducer = async (event:InternalEvent, state:State): Promise<void> => {
  switch (event.type) {
    case 'user/created':
      state.users.push(event.payload);
    case 'user/updated':
      const updateUser = state.users.find((user) => user.id === event.payload.id);
      if (updateUser) {
        updateUser.name = event.payload.name
      }
    case 'user/deleted':
      const nextUsers = state.users.filter((user) => user.id === event.payload.id);
      state.users = nextUsers;
  }

  return Promise.resolve();
}

export const createApp = (withinConnection: WithinConnection = withinTransaction) => {
  const state: State = { users: [] }
  const publish = async (event:AllEvents): Promise<EventId> => {
    const internalEvent = await withinConnection(async ({ client }) => {
      const result = await client.query(`
        INSERT INTO events (type, payload)
        VALUES ('${event.type}', '${JSON.stringify(event.payload)}')
        RETURNING *;
      `);
      return result.rows[0] as InternalEvent;
    });

    await withinConnection(async ({ client }) => {
      await reducer(internalEvent, state);
    });

    return internalEvent.id;
  }

  const read = () => state;

  return { publish, read };
}