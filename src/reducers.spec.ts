import expect from "expect";
import { createApp } from "./lib";
import { t, DBClient, WithinConnection } from "./lib/db";
import { ZonedDateTime } from "js-joda";
import { reducers, queries } from "./reducers";
import { Title, User } from "./domain";

const toThrow = async (fn: () => Promise<unknown>) => {
  let error;
  try {
    await fn()
  } catch(e) {
    error = e
  } finally {
    expect(error).toBeTruthy()
  }
}

describe('user', () => {
  it('create', t(async (withinConnection) => {
    const app = createApp({withinConnection, reducers, queries: {}});
    await app.publish({ type: 'user/created', payload: { id: 1, name: 'Test'} });
    await withinConnection(async ({ client }) => {
      const result = await client.query(`select * from Users where id = 1;`);
      expect(result.rows[0].name).toEqual('Test');
    });
  }));

  it('update', t(async (withinConnection) => {
    const app = createApp({withinConnection, reducers, queries: {}});
    await app.publish({ type: 'user/created', payload: { id: 1, name: 'Test'} });
    await app.publish({ type: 'user/updated', payload: { id: 1, name: 'Updated'} });
    await withinConnection(async ({ client }) => {
      const result = await client.query(`select * from Users where id = 1;`);
      expect(result.rows[0].name).toEqual('Updated');
    });
  }));



  it('delete', t(async (withinConnection) => {
    const app = createApp({withinConnection, reducers, queries: {}});
    await app.publish({ type: 'user/created', payload: { id: 1, name: 'Test'} });
    await app.publish({ type: 'user/deleted', payload: { id: 1} });
    await withinConnection(async ({ client }) => {
      const result = await client.query(`select * from Users where id = 1;`);
      expect(result.rows[0]).toEqual(undefined);
    });
  }));
});

describe('stamp', () => {
  it('create', t(async (withinConnection) => {
    const app = createApp({withinConnection, reducers, queries: {}});
    await app.publish({ type: 'stamp/created', payload: {
      timestamp: ZonedDateTime.parse('2000-01-01T01:00:10+10:00'),
      type: 'Start',
    } });

    await withinConnection(async ({ client }) => {
      const result = await client.query(`select * from Stamps;`);
      expect(result.rows.length).toEqual(1);
    });
  }));

  it('replace event', t(async (withinConnection) => {
    const app = createApp({withinConnection, reducers, queries: {}});
    const eventId = await app.publish({ type: 'stamp/created', payload: {
      timestamp: ZonedDateTime.parse('2000-01-01T01:00:10+10:00'),
      type: 'Start',
      note: 'test',
    } });

    await app.replaceEvent(eventId, { note: 'updated' });
    await withinConnection(async ({ client }) => {
      const result = await client.query(`select * from Stamps`);
      expect(result.rows[0].note).toEqual('updated');
    })
  }));

  it('replaces multiple events', t(async (withinConnection) => {
    const app = createApp({withinConnection, reducers, queries: {} });
    const eventId = await app.publish({ type: 'stamp/created', payload: {
      timestamp: ZonedDateTime.parse('2000-01-01T01:00:10+10:00'),
      type: 'Start',
      note: 'test',
    } });

    const eventId1 = await app.replaceEvent(eventId, { note: '1' });
    const eventId2 = await app.replaceEvent(eventId1, { note: '2' });
    await app.replaceEvent(eventId2, { note: '3' });

    await withinConnection(async ({ client }) => {
      const result = await client.query(`select * from Stamps`);
      expect(result.rows[0].note).toEqual('3');
    })
  }));


  it('can not replace same event twice', t(async (withinConnection) => {
    const app = createApp({withinConnection, reducers, queries: {}});
    const eventId = await app.publish({ type: 'stamp/created', payload: {
      timestamp: ZonedDateTime.parse('2000-01-01T01:00:10+10:00'),
      type: 'Start',
      note: 'test',
    } });

    await toThrow(async () => {
      await app.replaceEvent(eventId, { note: 'updated' });
      await app.replaceEvent(eventId, { note: 'updated' });
    });
  }));
});

it('rebuild aggregates', t(async (withinConnection) => {
  const app = createApp({withinConnection, reducers, queries: {}});
  await app.publish({ type: 'user/created', payload: { id: 1, name: 'Test'} });
  await app.publish({ type: 'user/created', payload: { id: 2, name: 'Testt'} });
  await app.rebuildAggregates();
  await withinConnection(async ({ client }) => {
    const result = await client.query(`select * from Users where id = 1;`);
    expect(result.rows[0].name).toEqual('Test');
  });
}));

describe('title', () => {
  it('title/created', t(async (withinConnection) => {
    const app = createApp({withinConnection, reducers, queries });
    await app.publish({ type: 'title/created', payload: {
      id: 1,
      name: 'DDr.',
      userId: 1
    } });

    const result = await app.query({ type: 'titles' }) as Title[];
    expect(result[0]).toHaveProperty('name', 'DDr.');
  }));

  it('title/notVerified', t(async (withinConnection) => {
    const app = createApp({withinConnection, reducers, queries });
    await app.publish({ type: 'title/created', payload: {
      id: 1,
      name: 'DDr.',
      userId: 1
    } });
    await app.publish({ type: 'title/notVerified', payload: { id: 1 } });
    const result = await app.query({ type: 'titles' }) as Title[];

    expect(result).toHaveProperty('length', 0);
  }));

  describe('title/verified', () => {
    const verifyTitle = async (withinConnection: WithinConnection) => {
      const app = createApp({withinConnection, reducers, queries });
      await app.publish({ type: 'user/created', payload: {
        id: 1,
        name: 'Hallo'
      }});
      await app.publish({ type: 'title/created', payload: {
        id: 1,
        name: 'DDr.',
        userId: 1
      } });

      const unverifiedTitles = await app.query({ type: 'titles' }) as Title[];
      await app.publish({
        type: 'title/verified',
        payload: { id: unverifiedTitles[0].id }
      });

      return app;
    }

    it('sets title to verified', t(async (withinConnection) => {
      const app = await verifyTitle(withinConnection)
      const verifiedTitles = await app.query({ type: 'titles' }) as Title[];
      expect(verifiedTitles[0]).toHaveProperty('kind', 'verified');
    }));

    it('adds title to user', t(async (withinConnection) => {
      const app = await verifyTitle(withinConnection)
      const users = await app.query({ type: 'users' }) as User[];
      expect(users[0]).toHaveProperty('title', 'DDr.');
    }));
  });
});
