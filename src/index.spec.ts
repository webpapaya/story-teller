import expect from "expect";
import { createApp } from ".";
import { t } from "./db";
import { ZonedDateTime } from "js-joda";



describe('user', () => {
  it('create', t(async (withinConnection) => {
    const app = createApp(withinConnection);
    await app.publish({ type: 'user/created', payload: { id: 1, name: 'Test'} });
    await withinConnection(async ({ client }) => {
      const result = await client.query(`select * from Users where id = 1;`);
      expect(result.rows[0].name).toEqual('Test');
    });
  }));

  it('update', t(async (withinConnection) => {
    const app = createApp(withinConnection);
    await app.publish({ type: 'user/created', payload: { id: 1, name: 'Test'} });
    await app.publish({ type: 'user/updated', payload: { id: 1, name: 'Updated'} });
    await withinConnection(async ({ client }) => {
      const result = await client.query(`select * from Users where id = 1;`);
      expect(result.rows[0].name).toEqual('Updated');
    });
  }));

  it('delete', t(async (withinConnection) => {
    const app = createApp(withinConnection);
    await app.publish({ type: 'user/created', payload: { id: 1, name: 'Test'} });
    await app.publish({ type: 'user/deleted', payload: { id: 1} });
    await withinConnection(async ({ client }) => {
      const result = await client.query(`select * from Users where id = 1;`);
      expect(result.rows[0]).toEqual(undefined);
    });
  }));
});

describe('stamp', () => {
  it.only('create', t(async (withinConnection) => {
    const app = createApp(withinConnection);
    await app.publish({ type: 'stamp/created', payload: {
      id: 1,
      timestamp: ZonedDateTime.parse('2000-01-01T01:00:10+10:00'),
      type: 'Start',
    } });

    await withinConnection(async ({ client }) => {
      const result = await client.query(`select * from Stamps where id = 1;`);
      expect(result.rows.length).toEqual(1);
    });
  }));
});

it('rebuild aggregates', t(async (withinConnection) => {
  const app = createApp(withinConnection);
  await app.publish({ type: 'user/created', payload: { id: 1, name: 'Test'} });
  await app.publish({ type: 'user/created', payload: { id: 2, name: 'Test'} });
  await app.rebuildAggregates();
  await withinConnection(async ({ client }) => {
    const result = await client.query(`select * from Users where id = 1;`);
    expect(result.rows[0].name).toEqual('Test');
  });
}));