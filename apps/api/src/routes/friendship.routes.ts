import { Router } from 'express';
import { friendshipController } from '../controllers/friendship.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router()

router.post('/friends', authMiddleware, friendshipController.sendRequest)
router.post('/friends/:friendshipId/accept', authMiddleware, friendshipController.acceptRequest)
router.post('/friends/:friendshipId/reject', authMiddleware, friendshipController.rejectRequest)

router.delete('/friends/:friendshipId', authMiddleware, friendshipController.removeFriend)

router.get('/friends', authMiddleware, friendshipController.listFriends)
router.get('/friends/pending', authMiddleware, friendshipController.listPendingRequests)

export default router