import { connectDb } from './models';
import server from './server';
const port = 4000;

connectDb().then(() => {
  server.start({ port }, () =>
    console.log(`Running server at http://localhost:${port}`)
  );
});
