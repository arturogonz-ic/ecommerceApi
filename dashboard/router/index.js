import { Router } from 'express';
import { getDashboard } from '../controller/index.js';
import { requireAdmin } from '../../admin-auth/middleware/requireAdmin.js';

const router = Router();

router.get('/', requireAdmin, getDashboard);

export default router;
