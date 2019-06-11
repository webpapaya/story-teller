import QueryStream from 'pg-query-stream';
import { ZonedDateTime } from 'js-joda';
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
  timestamp: ZonedDateTime,
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

  const replaceEvent = (eventId: EventId, payload: object) => {
    return withinConnection(async ({ client }) => {
      const eventToBeReplaced = await client.query(`
        SELECT * FROM Events WHERE id = $1
      `, [eventId]);
      const event = eventToBeReplaced.rows[0];
      const internalEvent: InternalEvent = {
        ...event,
        payload: { ...event.payload, ...payload }
      };

      const newEvent = await insertEvent(client, internalEvent);
      await client.query(`
        Update Events
        SET payload = null, replaced_by = $1
        WHERE id = $2
      `, [newEvent.id, eventId]);

      await rebuildAggregates();
    });
  }

  const read = () => state;
  const rebuildAggregates = () => {
    return withinConnection(async ({ client }) => {
      await Promise.all(['Users', 'Stamps'].map(async (schemaName) => {
        await client.query(`
          CREATE TABLE ${schemaName}_Copy AS
          TABLE ${schemaName}
          WITH NO DATA;
        `);
      }));

      await new Promise((resolve) => {
        const query = new QueryStream(`
          WITH RECURSIVE menu_tree (
            id,
            type,
            payload,
            replaced_by,
            created_at
          ) AS (
            SELECT
              id,
              type,
              payload,
              replaced_by,
              created_at
            FROM events
            WHERE replaced_by is not null
          UNION ALL
            SELECT
              mt.id,
              mn.type,
              mn.payload,
              mn.replaced_by,
              mn.created_at
            FROM events mn, menu_tree mt
            WHERE mt.replaced_by = mn.id
          ) SELECT DISTINCT on (id)
              id,
              last_value(payload) OVER wnd,
              first_value(type) OVER wnd,
              first_value(created_at) over wnd
            FROM menu_tree
            WINDOW wnd AS (
            PARTITION BY id ORDER BY created_at
            ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
          );
        `);
        const stream = client.query(query);
        stream.on('data', (event) => {
          reducer(event as InternalEvent, client, true)
        })
        stream.on('end', resolve)
      });


      await Promise.all(['Users', 'Stamps'].map(async (schemaName) => {
        await client.query(`ALTER TABLE ${schemaName} RENAME TO ${schemaName}_Deleted`);
        await client.query(`ALTER TABLE ${schemaName}_Copy RENAME TO ${schemaName}`);
        await client.query(`DROP TABLE ${schemaName}_Deleted`);
      }));
    });
  };

  return { publish, read, rebuildAggregates, replaceEvent };
}