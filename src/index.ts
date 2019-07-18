import QueryStream from 'pg-query-stream';
import { withinTransaction, WithinConnection, DBClient, withinNamespace } from './db';
import { EventId } from './types';
import { AllEvents, InternalEvent, Reducers } from './domain';

const reducers:Reducers = {
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

const reducer = async (event:InternalEvent, client:DBClient): Promise<void> => {
  await Promise.all(Object.keys(reducers).map((name) => {
    return reducers[name](event, client);
  }));
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
  const publish = async (event:AllEvents): Promise<EventId> => {
    return withinConnection(async ({ client }) => {
      const internalEvent = await insertEvent(client, event);
      await reducer(internalEvent, client)
      return internalEvent.id;
    });
  }

  const replaceEvent = (eventId: EventId, payload: object) => {
    return withinConnection(async ({ client }) => {
      const result = await client.query(`
        INSERT INTO events (type, payload)
        SELECT type, (payload::jsonb || '${JSON.stringify(payload)}'::jsonb) as payload
        FROM Events WHERE id = $1
        RETURNING *;
      `, [eventId]);

      const newEvent = result.rows[0] as InternalEvent;
      await client.query(`
        Update Events
        SET payload = null, replaced_by = $1
        WHERE id = $2
        RETURNING *
      `, [newEvent.id, eventId]);

      await rebuildAggregates();
      return newEvent.id;
    });
  }

  const rebuildAggregates = () => {
    return withinConnection(async ({ client }) => {
      return withinNamespace('rebuild_aggregates', client, async () => {
        await Promise.all(Object.keys(reducers).map(async (schemaName) => {
          await client.query(`
            CREATE TABLE ${schemaName} AS
            TABLE ${schemaName}
            WITH NO DATA;
          `);
        }));

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
              last_value(payload) OVER wnd as payload,
              first_value(type) OVER wnd as type,
              first_value(created_at) over wnd as created_at
            FROM menu_tree
            WINDOW wnd AS (
            PARTITION BY id ORDER BY created_at
            ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
          );
        `);

        const stream = client.query(query);
        for await (const event of stream) {
          await reducer(event as InternalEvent, client)
        }

        await Promise.all(Object.keys(reducers).map(async (tableName) => {
          await client.query(`
            ALTER TABLE ${tableName} RENAME TO ${tableName}_copy;
            ALTER TABLE ${tableName}_copy SET SCHEMA public;
            ALTER TABLE ${tableName} RENAME TO ${tableName}_Deleted;
            ALTER TABLE ${tableName}_Copy RENAME TO ${tableName};
            DROP TABLE ${tableName}_Deleted;
          `);
        }));
      });
    });
  };

  return { publish, rebuildAggregates, replaceEvent };
}