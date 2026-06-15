import * as adminService from '../service/index.js';
import { loginSchema } from '../validation/index.js';
import { success } from '../../shared/response/index.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000,
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const { token, admin } = await adminService.loginAdmin(data);
    res.cookie('admin_token', token, COOKIE_OPTIONS);
    res.json(success({ admin }));
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie('admin_token');
  res.json(success(null));
};

export const me = (req, res) => {
  const { _id: id, email, name } = req.admin;
  res.json(success({ admin: { id, email, name } }));
};
