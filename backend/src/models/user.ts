import { Document, model, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
}

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
