import { Router } from 'express';
import ImageController from '../controllers/images.controller';
import LikeController from '../controllers/likes.controller';
import CommentController from '../controllers/comments.controller';

const router = Router();

router.post('/', ImageController.create);
router.post('/:image_id/likes', LikeController.like);
router.post('/:image_id/comments', CommentController.create);
router.put('/:image_id/comments/:id', CommentController.update);
router.put('/:id', ImageController.update);
router.delete('/:id', ImageController.delete);
router.delete('/:image_id/comments/:id', CommentController.delete);

export default router;
