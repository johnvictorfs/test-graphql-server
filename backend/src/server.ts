import dotenv from 'dotenv';
dotenv.config();

import { GraphQLServer } from 'graphql-yoga';
import path from 'path';

import resolvers from './resolvers';

export default new GraphQLServer({
  context: req => ({ ...req }),
  resolvers,
  typeDefs: path.resolve(__dirname, 'schema.graphql'),
});
