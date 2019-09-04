import bcrypt from 'bcryptjs';
import { Context } from 'graphql-yoga/dist/types';
import jwt from 'jsonwebtoken';

import models from '../models';
import { IPost, IUser } from '../types';
import { getAuthUser, encryptedPassword } from '../helpers';

export default {
  Query: {
    users: () => models.User.find(),
    user: (_: any, { id }: IUser['_id']) => models.User.findById(id),
    userCount: () => models.User.countDocuments(),
  },
  Mutation: {
    createUser: async (_: any, { username, password, email }: IUser) => {
      const hash = await encryptedPassword(password);
      const newUser = new models.User({ username, password: hash, email });
      const error = await newUser.save();

      if (error) { return error; }
      return newUser;
    },
    login: async (_: any, { username, password }: IUser) => {
      const user = await models.User.findOne({ username });
      const comparison = await bcrypt.compareSync(password, user.password);

      if (comparison) { return jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET); }
      return null;
    },
    deleteUser: async (_: any, { id }: IUser) => {
      await models.User.findByIdAndDelete(id);
    },
    editUserSelf: async (_: any, user: IUser, ctx: Context) => {
      const decoded = getAuthUser(ctx);
      if (!decoded) { return false; }

      const result = await models.User.updateOne({ _id: decoded.id }, { $set: user });

      if (result.nModified === 1) {
        return true;
      }
      return false;
    },
  },
  Post: {
    author: (parent: IPost) => models.User.findById(parent.author)
  }
};
