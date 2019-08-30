import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import models from './models';
import { IUser } from './models/user';

interface IDecodedUser {
  id: string;
  username: string;
}

const Query = {
  user: (_: any, { id }: IUser) => models.User.findById(id),
  userCount: () => models.User.countDocuments(),
  users: () => models.User.find(),
};

const Mutation = {
  createUser: async (_: any, { username, password, email }: IUser) => {
    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hashSync(password, salt);

    const newUser = new models.User({ username, password: hash, email });
    const error = await newUser.save();

    if (error) { return error; }
    return true;
  },
  deleteUser: async (_: any, { id }: IUser) => {
    await models.User.findByIdAndDelete(id);
  },
  login: async (_: any, { username, password }: IUser) => {
    const user = await models.User.findOne({ username });
    const comparison = await bcrypt.compareSync(password, user.password);

    if (comparison) { return jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET); }
    return null;
  },
  updateSelfUser: async (_: any, user: IUser, ctx: any) => {
    const auth = ctx ? ctx.request.get('Authorization') : null;
    if (!auth) { return false; }

    const decoded = jwt.verify(auth, process.env.JWT_SECRET) as IDecodedUser;
    const result = await models.User.updateOne({ _id: decoded.id }, { $set: user });

    if (result.nModified === 1) {
      return true;
    }
    return false;
  }
};

export default { Mutation, Query };
