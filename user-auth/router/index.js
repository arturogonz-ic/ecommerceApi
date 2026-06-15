import { Router } from 'express';
import * as controller from '../controller/index.js';
import { requireUser } from '../middleware/requireUser.js';

const router = Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/me', requireUser, controller.me);
router.put('/me/address', requireUser, controller.updateAddress);

export default router;
