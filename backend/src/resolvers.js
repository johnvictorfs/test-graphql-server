import bcrypt from 'bcryptjs';
import models from './models';

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

      let comparison = null;
      try {
        comparison = await bcrypt.compareSync(password, user.password);
      } catch (error) {
        return null;
      }
      return comparison;
    },
    deleteUser: async (_, { id }) => {
      await models.User.findByIdAndDelete(id);
    }
  }
}
