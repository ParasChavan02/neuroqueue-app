import { Router } from 'express';

import { create, getOne, list, run } from '../controllers/taskController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
router.post('/:id/run', run);

export default router;

