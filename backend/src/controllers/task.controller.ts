import { Response } from 'express';
import { AuthRequest } from '../middlewares/requireUser';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/tasks.schema';
import { deleteTaskService, updateTaskService, getTaskByIdService, createTaskService, listOverdueTasksService, listAllTasksService } from '../services/tasks.service';
import { io } from '../index';
import { notifyTaskAssignment } from '../services/notification.service';

export const createTask = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const body = req.body as CreateTaskInput;


  console.log('Creating task with userId:', userId, 'body:', body);

  const task = await createTaskService(userId, body);

  io.emit('task:created', task);

  if (task.assignedToId && task.assignedToId !== userId) {
    io.to(task.assignedToId).emit('task:assigned', {
      taskId: task.id,
      title: task.title,
      assignedToId: task.assignedToId,
      creatorId: task.creatorId,
      type: 'assigned',
    });
    
    await notifyTaskAssignment(task.assignedToId, task.id, task.title);
  }
  
  return res.status(201).json({ status: 'success', data: task });
};

export const getTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const task = await getTaskByIdService(id);

  if (!task) {
    return res.status(404).json({ status: 'fail', message: 'Task not found' });
  }

  return res.json({ status: 'success', data: task });
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const body = req.body as UpdateTaskInput;

  const previous = await getTaskByIdService(id);
  if (!previous) {
    return res.status(404).json({ status: 'fail', message: 'Task not found' });
  }

  const task = await updateTaskService(id, body);

  io.emit('task:updated', task);
  
  if (body.assignedToId && body.assignedToId !== previous.assignedToId && body.assignedToId !== req.user!.id) {
    io.to(body.assignedToId).emit('task:assigned', {
      taskId: task.id,
      title: task.title,
      assignedToId: body.assignedToId,
      creatorId: task.creatorId,
      type: 'reassigned',
    });
    await notifyTaskAssignment(body.assignedToId, task.id, task.title);
  }

  return res.json({ status: 'success', data: task });
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  await deleteTaskService(id);
  io.emit('task:deleted', { id }); 
  return res.status(204).send();
};



export const listTasks = async (req: AuthRequest, res: Response) => {
  const tasks = await listAllTasksService(req.query);

  return res.json({ status: 'success', data: tasks });
};

export const listOverdueTasks = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const tasks = await listOverdueTasksService(userId);

  return res.json({ status: 'success', data: tasks });
};
