import jwt from 'jsonwebtoken';
import { z } from 'zod';

import User from '../models/User.js';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

const createToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

export const registerUser = async (payload) => {
  const parsed = registerSchema.parse(payload);
  const existingUser = await User.findOne({ email: parsed.email.toLowerCase() });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create(parsed);
  const token = createToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
};

export const loginUser = async (payload) => {
  const parsed = loginSchema.parse(payload);
  const user = await User.findOne({ email: parsed.email.toLowerCase() });
  if (!user || !(await user.comparePassword(parsed.password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  return {
    token: createToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
};

