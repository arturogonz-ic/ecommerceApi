import jwt from 'jsonwebtoken';
import { AppError } from '../../shared/error/AppError.js';
import { getUserById } from '../service/index.js';

export const requireUser = async (req, res, next) => {
  try {
    const token = req.cookies?.user_token;
    if (!token) throw new AppError(401, 'Unauthorized');
    const payload = jwt.verify(token, process.env.JWT_USER_SECRET);
    req.user = await getUserById(payload.id);
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError(401, 'Unauthorized'));
  }
};
