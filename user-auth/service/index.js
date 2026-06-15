import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../model/User.js';
import { AppError } from '../../shared/error/AppError.js';

export const registerUser = async ({ email, password, name, billingAddress }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError(409, 'Email already in use');
  const hashed = await bcrypt.hash(password, 10);
  const userData = { email, password: hashed, name };
  if (billingAddress) userData.billingAddress = billingAddress;
  const user = await User.create(userData);
  const token = jwt.sign({ id: user._id }, process.env.JWT_USER_SECRET, { expiresIn: '7d' });
  return { token, user: { id: user._id, email: user.email, name: user.name, billingAddress: user.billingAddress } };
};

export const updateUserAddress = async (userId, billingAddress) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { billingAddress },
    { new: true, select: '-password' }
  );
  if (!user) throw new AppError(404, 'User not found');
  return user.billingAddress;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError(401, 'Invalid credentials');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError(401, 'Invalid credentials');
  const token = jwt.sign({ id: user._id }, process.env.JWT_USER_SECRET, { expiresIn: '7d' });
  return { token, user: { id: user._id, email: user.email, name: user.name } };
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) throw new AppError(401, 'Unauthorized');
  return user;
};
