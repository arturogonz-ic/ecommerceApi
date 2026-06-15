import jwt from 'jsonwebtoken';
import { AppError } from '../../shared/error/AppError.js';
import { getAdminById } from '../service/index.js';

export const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.admin_token;
    if (!token) throw new AppError(401, 'Unauthorized');
    const payload = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    req.admin = await getAdminById(payload.id);
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError(401, 'Unauthorized'));
  }
};
