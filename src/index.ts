import { Pool, PoolClient, Connection } from 'pg';

const pool = new Pool({
  host: 'localhost',
  user: 'dbuser',
  password: 'password',
  database: 'compup',
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});


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

const withinConnection = async <T>(fn: (client: PoolClient) => T): Promise<T> => {
  const connection = await pool.connect();
  try {
    return await fn(connection);
  } finally {
    await connection.release();
  }
}

export const createApp = () => {
  const state: State = { users: [] }
  const publish = async (event:AllEvents): Promise<EventId> => {
    const internalEvent = await withinConnection(async (client) => {
      const result = await client.query(`
        INSERT INTO events (type, payload)
        VALUES ('${event.type}', '${JSON.stringify(event.payload)}')
        RETURNING *;
      `);
      return result.rows[0] as InternalEvent;
    });

    await reducer(internalEvent, state);
    return internalEvent.id;
  }

  const read = () => state;

  return { publish, read };
}