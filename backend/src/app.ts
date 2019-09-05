import { Options } from 'graphql-yoga';
import { formatError } from 'apollo-errors';

import { connectDb } from './models';
import server from './server';

const port = 4000;

const options: Options = {
  formatError,
  port
};

connectDb().then(async () => {
  await server.start(options, () => console.log(`Running server at http://localhost:${port}`));
});
