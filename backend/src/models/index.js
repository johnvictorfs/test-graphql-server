import mongoose from 'mongoose';

import User from './user';

mongoose.set('useCreateIndex', true);

if (global.__MONGO_URI__ === undefined) {
  global.__MONGO_URI__ = 'mongodb://localhost:27017/node-test-server';
}

export const connectDb = () => {
  return mongoose.connect(global.__MONGO_URI__, {
    useNewUrlParser: true,
    dbName: global.__MONGO_DB_NAME__
  });
};

export default { User };
