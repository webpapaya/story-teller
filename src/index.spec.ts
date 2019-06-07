import { createApp } from ".";

it('create user', async () => {
  const app = createApp();
  await app.publish({ type: 'user/created', payload: { id: 1, name: 'Test'} });
  console.log(app.read());
})