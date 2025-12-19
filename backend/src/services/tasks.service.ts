import {
  createTaskRepo,
  getTaskByIdRepo,
  updateTaskRepo,
  deleteTaskRepo,
  listTasksForUserRepo,
  listAllTasksRepo,
  listOverdueTasksRepo,
} from '../repositories/task.repository';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/tasks.schema';

export const createTaskService = (creatorId: string, data: CreateTaskInput) => {
  return createTaskRepo(creatorId, data);
};

export const getTaskByIdService = (id: string) => {
  return getTaskByIdRepo(id);
};

export const updateTaskService = (id: string, data: UpdateTaskInput) => {
  return updateTaskRepo(id, data);
};

export const deleteTaskService = (id: string) => {
  return deleteTaskRepo(id);
};


export const listAllTasksService = (query: any) => {
  const status = query.status as string | undefined;
  const priority = query.priority as string | undefined;
  const sortByDueDate = (query.sortByDueDate as 'asc' | 'desc' | undefined) ?? undefined;

  return listAllTasksRepo({ status, priority, sortByDueDate });
};

export const listTasksForUserService = (userId: string, query: any) => {
  const status = query.status as string | undefined;
  const priority = query.priority as string | undefined;
  const sortByDueDate = (query.sortByDueDate as 'asc' | 'desc' | undefined) ?? undefined;

  return listTasksForUserRepo(userId, { status, priority, sortByDueDate });
};

export const listOverdueTasksService = (userId: string) => {
  return listOverdueTasksRepo(userId);
};
