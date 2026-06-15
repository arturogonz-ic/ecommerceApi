import { ZodError } from 'zod';
import { AppError } from './AppError.js';
import { failure } from '../response/index.js';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    const issues = err.issues ?? err.errors;
    return res.status(400).json(failure(400, issues[0].message));
  }
  if (err instanceof AppError) {
    return res.status(err.code).json(failure(err.code, err.message));
  }
  console.error(err);
  res.status(500).json(failure(500, 'Internal server error'));
};
