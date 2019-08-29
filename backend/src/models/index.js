import mongoose from 'mongoose';

import User from './user';

const mongo_uri = global.__MONGO_URI__ ? global.__MONGO_URI__ : 'mongodb://localhost:27017/node-test-server';

export const connectDb = () => {
  return mongoose.connect(mongo_uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    dbName: global.__MONGO_DB_NAME__
  });
};

export default { User };
