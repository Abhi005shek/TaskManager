import { Router } from 'express';
import { getMe, updateMe, getUsers } from '../controllers/user.controller';
import { requireUser } from '../middlewares/requireUser';
import validateResource from '../middlewares/validateResources';
import { updateUserSchema } from '../schemas/user.schema';

const router = Router();

router.route('/me').get(requireUser, getMe)
.patch(requireUser, validateResource(updateUserSchema), updateMe);
router.get("/", requireUser, getUsers);
export default router;
