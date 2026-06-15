import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app.js';
import { User } from '../user-auth/model/User.js';
import { Admin } from '../admin-auth/model/Admin.js';

export const api = request(app);

export const createUser = async (overrides = {}) => {
  const data = { email: 'user@test.com', password: 'password123', name: 'Test User', ...overrides };
  const hashed = await bcrypt.hash(data.password, 10);
  return User.create({ ...data, password: hashed });
};

export const createAdmin = async (overrides = {}) => {
  const data = { email: 'admin@test.com', password: 'adminpass123', name: 'Test Admin', ...overrides };
  const hashed = await bcrypt.hash(data.password, 10);
  return Admin.create({ ...data, password: hashed });
};

export const loginUser = async (email = 'user@test.com', password = 'password123') => {
  const res = await api.post('/user-auth/login').send({ email, password });
  const cookie = res.headers['set-cookie'];
  return cookie;
};

export const loginAdmin = async (email = 'admin@test.com', password = 'adminpass123') => {
  const res = await api.post('/admin-auth/login').send({ email, password });
  const cookie = res.headers['set-cookie'];
  return cookie;
};
