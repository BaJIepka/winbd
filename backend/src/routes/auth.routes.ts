import { Router } from 'express';
import { registerHandler, loginHandler, refreshHandler, logoutHandler } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from '../schemas/auth.schemas';

const router = Router();

router.post('/register', validate(registerSchema), registerHandler);
router.post('/login', validate(loginSchema), loginHandler);
router.post('/refresh', validate(refreshSchema), refreshHandler);
router.post('/logout', validate(logoutSchema), logoutHandler);

export default router;
