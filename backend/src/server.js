import { GraphQLServer } from 'graphql-yoga';
import path from 'path';

import resolvers from './resolvers';

export default new GraphQLServer({
  typeDefs: path.resolve(__dirname, 'schema.graphql'),
  resolvers
});
