import { Router } from 'express';
import { requireUser } from '../middlewares/requireUser';
import validateResource from '../middlewares/validateResources';
import { createTaskSchema, updateTaskSchema } from '../schemas/tasks.schema';
import {
  createTask,
  getTask,
  updateTask,
  deleteTask,
  listTasks,
  listOverdueTasks,
} from '../controllers/task.controller';

const router = Router();

router.post('/', requireUser, validateResource(createTaskSchema), createTask);
router.route('/:id').get(requireUser, getTask).patch(requireUser, validateResource(updateTaskSchema), updateTask).delete(requireUser, deleteTask);
router.get('/', requireUser, listTasks);
router.get('/overdue', requireUser, listOverdueTasks);
export default router;
