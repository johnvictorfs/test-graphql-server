import dotenv from 'dotenv';
import { GraphQLServer } from 'graphql-yoga';

import { default as typeDefs } from './schemas';
import { default as resolvers } from './resolvers';

dotenv.config();

export default new GraphQLServer({
  context: req => ({ ...req }),
  resolvers,
  typeDefs,
});
