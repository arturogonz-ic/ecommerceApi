import { Router } from 'express';
import * as controller from '../controller/index.js';
import { requireAdmin } from '../../admin-auth/middleware/requireAdmin.js';

const router = Router();

router.get('/', controller.listCategories);
router.post('/', requireAdmin, controller.createCategory);
router.delete('/:id', requireAdmin, controller.deleteCategory);
router.get('/:id/product-count', requireAdmin, controller.getProductCount);
router.post('/:id/discount', requireAdmin, controller.applyCategoryDiscount);
router.delete('/:id/discount', requireAdmin, controller.removeCategoryDiscount);

export default router;
