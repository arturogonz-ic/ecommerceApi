import { getDashboardStats } from '../service/index.js';
import { periodSchema } from '../validation/index.js';
import { success } from '../../shared/response/index.js';

export const getDashboard = async (req, res, next) => {
  try {
    const { period } = periodSchema.parse(req.query);
    const stats = await getDashboardStats(period);
    res.json(success(stats));
  } catch (err) {
    next(err);
  }
};
