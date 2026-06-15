import { Router } from 'express';
import * as controller from '../controller/index.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/me', requireAdmin, controller.me);

export default router;
