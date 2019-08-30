import { Context } from 'graphql-yoga/dist/types';
import jwt from 'jsonwebtoken';

import models from '../models';
import { IPost } from '../models/post';
import { IDecodedUser } from './types';

export default {
  Query: {
    posts: () => models.Post.find(),
    post: (_: any, { id }: IPost['_id']) => models.Post.findById(id),
    postCount: () => models.Post.countDocuments()
  },
  Mutation: {
    createPost: async (_: any, post: IPost, ctx: Context) => {
      const auth = ctx ? ctx.request.get('Authorization') : null;
      if (!auth) { return false; }

      const decoded = jwt.verify(auth, process.env.JWT_SECRET) as IDecodedUser;
      const newPost = new models.Post({ ...post, author: decoded.id });
      const error = await newPost.save();
      if (error) { return error; }
      return newPost;
    }
  }
}