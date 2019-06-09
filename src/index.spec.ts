import { createApp } from ".";
import { t } from "./db";

it('create user', t(async (withinConnection) => {
  const app = createApp(withinConnection);
  await app.publish({ type: 'user/created', payload: { id: 1, name: 'Test'} });
}))

