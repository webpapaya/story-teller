import QueryStream from 'pg-query-stream';
import { DBClient, withinNamespace } from './db';
import { EventId, GenericEvent, Config } from './types';



export function createApp<DomainEvent extends GenericEvent>(config: Config<DomainEvent>) {
  type InternalEvent = DomainEvent & { id: string }
  const tableName = config.tableName || 'events'
  const rebuildSchemaName = config.rebuildSchemaName || 'rebuild_aggregates'

  const insertEvent = async (client: DBClient, event: DomainEvent) => {
    const result = await client.query(`
      INSERT INTO ${tableName} (type, payload)
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

  const publish = async (event:DomainEvent): Promise<EventId> => {
    return config.withinConnection(async ({ client }) => {
      const internalEvent = await insertEvent(client, event);
      await reducer(internalEvent as InternalEvent, client)
      return internalEvent.id;
    });
  }

  const replaceEvent = (eventId: EventId, payload: object) => {
    return config.withinConnection(async ({ client }) => {
      const result = await client.query(`
        INSERT INTO ${tableName} (type, payload)
        SELECT type, (payload::jsonb || '${JSON.stringify(payload)}'::jsonb) as payload
        FROM ${tableName} WHERE id = $1
        RETURNING *;
      `, [eventId]);

      const newEvent = result.rows[0] as InternalEvent;
      await client.query(`
        Update ${tableName}
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
      return withinNamespace(rebuildSchemaName, client, async () => {
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
            FROM ${tableName}
          UNION ALL
            SELECT
              mt.id,
              mn.type,
              mn.payload,
              mn.replaced_by,
              mn.created_at
            FROM ${tableName} mn, menu_tree mt
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
            ALTER TABLE ${tableName} RENAME TO ${tableName}_deleted;
            ALTER TABLE ${tableName}_copy RENAME TO ${tableName};
            DROP TABLE ${tableName}_deleted;
          `);
        }));
      });
    });
  };

  const query = async ({ type }: { type: string }) => {
    return config.withinConnection(async ({ client }) => {
      if (config.queries[type]) {
        return config.queries[type](client);
      } else {
        return []
      }
    });
  }

  return { publish, rebuildAggregates, replaceEvent, query };
}