import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router()

router.post('/auth/register', authController.register)
router.post('/auth/login', authController.login)

router.delete('/auth/delete', authMiddleware, authController.delete)

router.post('/auth/logout', authController.logout)

export default router