import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadImage } from '../controllers/uploads.controller';

const router = Router();

router.use(authenticate);
router.post('/image', upload.single('image'), uploadImage);

export default router;
