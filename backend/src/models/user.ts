import { model, Schema } from 'mongoose';
import { IUser } from '../types';

const userSchema: Schema = new Schema({
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    unique: false
  },
  username: {
    type: String,
    unique: true
  }
});

export default model<IUser>('User', userSchema);
