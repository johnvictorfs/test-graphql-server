import { Document } from 'mongoose';

import { IUser } from './user';

export interface IPost extends Document {
  title: string;
  description: string;
  content: string;
  author: IUser['_id'];
}
