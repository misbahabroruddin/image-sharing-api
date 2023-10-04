import { Router } from 'express';
import { authMiddleware } from './../middlewares/auth.middleware';
import authRouter from './auth.route';
import userRouter from './user.route';
import imageRouter from './image.route';
import upload from './../middlewares/upload.middleware';
import ImageController from '../controllers/images.controller';

const router = Router();

router.use('/auth', authRouter);
router.get('/images', ImageController.getAll);
router.get('/images/:id', ImageController.getById);
router.use(authMiddleware);
router.use('/users', upload.single('profile_picture_url'), userRouter);
router.use('/images', upload.single('image_url'), imageRouter);

export default router;
