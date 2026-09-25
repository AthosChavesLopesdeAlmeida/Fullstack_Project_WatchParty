import { Router } from 'express';
import { videosController } from '../controllers/video.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router()

router.post('/videos/', authMiddleware, videosController.createVideo)
router.post('/videos/:videoId/complete', authMiddleware, videosController.completeUpload)

router.delete('/videos/:videoId', authMiddleware, videosController.deleteVideo)

router.get('/videos/', authMiddleware, videosController.listMyVideos)
router.get('/videos/:videoId', authMiddleware, videosController.getVideo)

export default router