import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import * as newsController from '../controllers/news.controller';

const router = Router();

const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'files', maxCount: 10 },
]);

router.use(authenticate);

router.get('/', newsController.getAll);
router.get('/:id', newsController.getOne);
router.post('/', uploadFields, newsController.create);
router.put('/:id', uploadFields, newsController.update);
router.delete('/:id', newsController.remove);
router.post('/:id/publish', newsController.publish);
router.post('/:id/schedule', newsController.schedulePublish);

export default router;
