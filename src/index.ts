type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type EventId = number;
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

type InternalEvent = { eventId: EventId } & AllEvents;

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

export const createApp = () => {
  const state: State = { users: [] }
  const store: Events = [];
  const publish = async (event:AllEvents): Promise<EventId> => {
    const eventId = +new Date() + Math.random();
    const internalEvent = { ...event, eventId }
    store.push(internalEvent);
    await reducer(internalEvent, state);
    return eventId;
  }

  const read = () => state;

  return { publish, read };
}