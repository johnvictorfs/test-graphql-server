import { connectDb } from './models';
import server from './server';
const port = 4000;

connectDb().then(async () => {
  await server.start({ port }, () => console.log(`Running server at http://localhost:${port}`));
});
