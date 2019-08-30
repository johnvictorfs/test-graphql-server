import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Post from './post';
import User from './user';

dotenv.config();

declare global {
  namespace NodeJS {
    interface Global {
      TEST_MONGO_URI: string;
      MONGO_DB_NAME: string;
    }
  }
}

const mongoUri = global.TEST_MONGO_URI ? global.TEST_MONGO_URI : process.env.MONGO_URI;

export const connectDb = () => {
  return mongoose.connect(mongoUri, {
    dbName: global.MONGO_DB_NAME,
    useCreateIndex: true,
    useNewUrlParser: true
  });
};

export default { User, Post };
