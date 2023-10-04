import { Router } from 'express';
import UserController from '../controllers/user.controller';

const router = Router();

router.get('/me', UserController.getUserLogin);
router.put('/me', UserController.update);
router.get('/:username', UserController.getByUsername);

export default router;
