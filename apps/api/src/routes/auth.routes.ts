import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)

router.delete('/delete', authMiddleware, authController.delete)

router.post('/logout', authController.logout)

export default router