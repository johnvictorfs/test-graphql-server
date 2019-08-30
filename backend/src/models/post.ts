import { Document, model, Schema } from 'mongoose';
import { IUser } from './user';

export interface IPost extends Document {
  title: string;
  description: string;
  content: string;
  author: IUser['_id'];
}

const postSchema: Schema = new Schema({
  title: {
    required: true,
    type: String
  },
  description: {
    required: true,
    type: String
  },
  content: {
    required: true,
    type: String
  },
  author: {
    required: true,
    type: Schema.Types.ObjectId
  }
});

export default model<IPost>('Post', postSchema);
