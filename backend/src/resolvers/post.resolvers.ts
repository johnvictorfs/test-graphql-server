import { Context } from 'graphql-yoga/dist/types';

import models from '../models';
import { IPost, IUser } from '../types';
import { getAuthUser } from '../helpers';

export default {
  Query: {
    posts: () => models.Post.find(),
    post: (_: any, { id }: IPost['_id']) => models.Post.findById(id),
    postCount: () => models.Post.countDocuments()
  },
  Mutation: {
    createPost: async (_: any, post: IPost, ctx: Context) => {
      const decoded = getAuthUser(ctx);
      if (!decoded) { return null; }

      const newPost = new models.Post({ ...post, author: decoded.id });
      const error = await newPost.save();
      if (error) { return error; }
      return newPost;
    }
  },
  User: {
    posts: (parent: IUser) => models.Post.find({ author: parent.id })
  }
};
