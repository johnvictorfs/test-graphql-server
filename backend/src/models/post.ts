import { model, Schema } from 'mongoose';
import { IPost } from '../types';

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
