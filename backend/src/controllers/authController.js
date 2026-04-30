import { loginUser, registerUser } from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const response = await registerUser(req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const response = await loginUser(req.body);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

