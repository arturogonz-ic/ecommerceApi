import { Router } from 'express';
import * as controller from '../controller/index.js';
import { requireUser } from '../../user-auth/middleware/requireUser.js';
import { requireAdmin } from '../../admin-auth/middleware/requireAdmin.js';

const router = Router();

// User routes
router.post('/', requireUser, controller.createOrder);
router.get('/mine', requireUser, controller.myOrders);
router.get('/my/:id', requireUser, controller.myOrderDetail);

// Admin routes
router.get('/', requireAdmin, controller.allOrders);
router.get('/:id', requireAdmin, controller.orderDetail);
router.patch('/:id/status', requireAdmin, controller.updateStatus);

export default router;
