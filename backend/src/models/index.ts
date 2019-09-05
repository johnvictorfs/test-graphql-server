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
  const settings = {
    dbName: global.MONGO_DB_NAME,
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
  };

  return mongoose.connect(mongoUri, settings);
};

export default { User, Post };
