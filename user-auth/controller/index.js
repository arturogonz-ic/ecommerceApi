import * as userService from '../service/index.js';
import { registerSchema, loginSchema, updateAddressSchema } from '../validation/index.js';
import { success } from '../../shared/response/index.js';

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: isProd ? 'none' : 'lax',
  secure: isProd,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const { token, user } = await userService.registerUser(data);
    res.cookie('user_token', token, COOKIE_OPTIONS);
    res.status(201).json(success({ user }));
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const { token, user } = await userService.loginUser(data);
    res.cookie('user_token', token, COOKIE_OPTIONS);
    res.json(success({ user }));
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie('user_token', { sameSite: isProd ? 'none' : 'lax', secure: isProd });
  res.json(success(null));
};

export const me = (req, res) => {
  const { _id: id, email, name, billingAddress } = req.user;
  res.json(success({ user: { id, email, name, billingAddress } }));
};

export const updateAddress = async (req, res, next) => {
  try {
    const data = updateAddressSchema.parse(req.body);
    const billingAddress = await userService.updateUserAddress(req.user._id, data);
    res.json(success({ billingAddress }));
  } catch (err) {
    next(err);
  }
};
