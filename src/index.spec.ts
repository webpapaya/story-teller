import { createApp } from ".";
import { t } from "./db";
import expect from "expect";

it('create user', t(async (withinConnection) => {
  const app = createApp(withinConnection);
  await app.publish({ type: 'user/created', payload: { id: 1, name: 'Test'} });
  await withinConnection(async ({ client }) => {
    const result = await client.query(`select * from Users where id = 1;`);
    expect(result.rows[0].name).toEqual('Test');
  });
}));

it('update user', t(async (withinConnection) => {
  const app = createApp(withinConnection);
  await app.publish({ type: 'user/created', payload: { id: 1, name: 'Test'} });
  await app.publish({ type: 'user/updated', payload: { id: 1, name: 'Updated'} });
  await withinConnection(async ({ client }) => {
    const result = await client.query(`select * from Users where id = 1;`);
    expect(result.rows[0].name).toEqual('Updated');
  });
}));

it('delete user', t(async (withinConnection) => {
  const app = createApp(withinConnection);
  await app.publish({ type: 'user/created', payload: { id: 1, name: 'Test'} });
  await app.publish({ type: 'user/deleted', payload: { id: 1} });
  await withinConnection(async ({ client }) => {
    const result = await client.query(`select * from Users where id = 1;`);
    expect(result.rows[0]).toEqual(undefined);
  });
}));

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