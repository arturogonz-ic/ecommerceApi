import { Router } from 'express';
import * as controller from '../controller/index.js';
import { requireAdmin } from '../../admin-auth/middleware/requireAdmin.js';
import { upload } from '../upload/index.js';

const router = Router();

router.get('/products', controller.listProducts);
router.get('/products/best-sellers', controller.bestSellers);
router.get('/products/:id', controller.getProduct);
router.post('/products', requireAdmin, upload.array('images'), controller.createProduct);
router.put('/products/:id', requireAdmin, controller.updateProduct);
router.delete('/products/:id', requireAdmin, controller.deleteProduct);
router.delete('/products/:id/images/:index', requireAdmin, controller.deleteImage);
router.post('/products/:id/discount', requireAdmin, controller.applyProductDiscount);
router.delete('/products/:id/discount', requireAdmin, controller.removeProductDiscount);

export default router;
