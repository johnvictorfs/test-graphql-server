import { Document } from 'mongoose';

export interface IDecodedUser {
  id: string;
  username: string;
}

export interface IPost extends Document {
  title: string;
  description: string;
  content: string;
  author: IUser['_id'];
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  id: string;
}
