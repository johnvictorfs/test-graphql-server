import dotenv from 'dotenv';
dotenv.config();

import { GraphQLServer } from 'graphql-yoga';

import { default as typeDefs } from './schemas';
import { default as resolvers } from './resolvers';

export default new GraphQLServer({
  context: req => ({ ...req }),
  resolvers,
  typeDefs,
});
