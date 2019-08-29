import { GraphQLServer } from 'graphql-yoga';
import path from 'path';
import dotenv from 'dotenv';

import resolvers from './resolvers';

dotenv.config();

export default new GraphQLServer({
  typeDefs: path.resolve(__dirname, 'schema.graphql'),
  resolvers,
  context: req => ({ ...req })
});
