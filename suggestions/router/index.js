import { Router } from 'express';
import * as controller from '../controller/index.js';
import { requireUser } from '../../user-auth/middleware/requireUser.js';
import { requireAdmin } from '../../admin-auth/middleware/requireAdmin.js';

const router = Router();

router.post('/', requireUser, controller.submit);
router.get('/', requireAdmin, controller.list);
router.patch('/:id/read', requireAdmin, controller.markRead);
router.delete('/:id', requireAdmin, controller.remove);

export default router;
