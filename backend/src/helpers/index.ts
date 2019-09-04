import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Context } from 'graphql-yoga/dist/types';

import { IDecodedUser } from '../types';

export const getAuthUser = (ctx: Context): IDecodedUser | null => {
  /**
   * Gets decoded user data from JWT Token in Authorization Headers
   */
  const auth = ctx ? ctx.request.get('Authorization') : null;
  if (!auth) { return null; }

  return jwt.verify(auth, process.env.JWT_SECRET) as IDecodedUser;
};

export const encryptedPassword = async (password: string): Promise<string> => {
  /**
   * Encrypts a password with bcrypt.js and returns its hash
   */
  const salt = await bcrypt.genSaltSync(10);
  const hash = await bcrypt.hashSync(password, salt);
  return hash;
};
