import QueryStream from 'pg-query-stream';
import { withinTransaction, WithinConnection, DBClient, withinNamespace } from './db';
import { EventId, GenericEvent, UnboundReducers, Config } from './types';

export function createApp<T extends GenericEvent>(config: Config<T>) {
  type InternalEvent = T & { id: string }


  const insertEvent = async (client: DBClient, event: GenericEvent) => {
    const result = await client.query(`
      INSERT INTO events (type, payload)
      VALUES ('${event.type}', '${JSON.stringify(event.payload)}')
      RETURNING *;
    `);

    return result.rows[0] as InternalEvent;
  }

  const reducer = async (event:InternalEvent, client:DBClient): Promise<void> => {
    await Promise.all(Object.keys(config.reducers).map((name) => {
      return config.reducers[name](event, client);
    }));
  }

  const publish = async (event:GenericEvent): Promise<EventId> => {
    return config.withinConnection(async ({ client }) => {
      const internalEvent = await insertEvent(client, event);
      await reducer(internalEvent as InternalEvent, client)
      return internalEvent.id;
    });
  }

  const replaceEvent = (eventId: EventId, payload: object) => {
    return config.withinConnection(async ({ client }) => {
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
    return config.withinConnection(async ({ client }) => {
      return withinNamespace('rebuild_aggregates', client, async () => {
        await Promise.all(Object.keys(config.reducers).map(async (schemaName) => {
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
          await reducer(event, client)
        }

        await Promise.all(Object.keys(config.reducers).map(async (tableName) => {
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