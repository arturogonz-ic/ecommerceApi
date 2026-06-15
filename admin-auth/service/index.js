import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../model/Admin.js';
import { AppError } from '../../shared/error/AppError.js';

export const loginAdmin = async ({ email, password }) => {
  const admin = await Admin.findOne({ email });
  if (!admin) throw new AppError(401, 'Invalid credentials');
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) throw new AppError(401, 'Invalid credentials');
  const token = jwt.sign({ id: admin._id }, process.env.JWT_ADMIN_SECRET, { expiresIn: '24h' });
  return { token, admin: { id: admin._id, email: admin.email, name: admin.name } };
};

export const getAdminById = async (id) => {
  const admin = await Admin.findById(id).select('-password');
  if (!admin) throw new AppError(401, 'Unauthorized');
  return admin;
};
