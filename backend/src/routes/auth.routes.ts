import { Router } from 'express';
import validateResource from '../middlewares/validateResources';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { register, login, logout } from '../controllers/auth.controller';

const router = Router();

router.post('/register',validateResource(registerSchema), register);
router.post('/login', validateResource(loginSchema),  login);
router.post('/logout', logout );

export default router;
