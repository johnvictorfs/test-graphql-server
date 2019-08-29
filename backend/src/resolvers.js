import bcrypt from 'bcryptjs';
import models from './models';
import jwt from 'jsonwebtoken';

export default {
  Query: {
    userCount: () => models.User.countDocuments(),
    users: () => models.User.find(),
    user: (_, { id }) => models.User.findById(id)
  },

  Mutation: {
    createUser: async (_, { username, password, email }) => {
      const salt = await bcrypt.genSaltSync(10);
      const hash = await bcrypt.hashSync(password, salt);

      const newUser = new models.User({ username, password: hash, email });
      const error = await newUser.save();

      if (error) return error;
      return true;
    },
    login: async (_, { username, password }) => {
      const user = await models.User.findOne({ username });
      const comparison = await bcrypt.compareSync(password, user.password);

      if (comparison) return jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);
      return null;
    },
    deleteUser: async (_, { id }) => {
      await models.User.findByIdAndDelete(id);
    },
    updateSelfUser: async(_, args, ctx) => {
      const auth = ctx ? ctx.request.get('Authorization') : null;
      if (!auth) return false;

      const decoded = jwt.verify(auth, process.env.JWT_SECRET);
      const result = await models.User.updateOne({ _id: decoded.id }, { $set: args });

      if (result.nModified === 1) {
        return true;
      }
      return false;
    }
  }
};
