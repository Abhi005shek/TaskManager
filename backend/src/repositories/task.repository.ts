import {prisma} from '../utils/prisma';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/tasks.schema';

export const createTaskRepo = async (creatorId: string, data: CreateTaskInput) => {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      priority: data.priority,
      status: data.status ?? 'TODO',
      creatorId,
      assignedToId: data.assignedToId ?? null,
    },
  });
};

export const getTaskByIdRepo = async (id: string) => {
  return prisma.task.findUnique({ where: { id } });
};

export const updateTaskRepo = async (id: string, data: UpdateTaskInput) => {
  return prisma.task.update({
    where: { id },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  });
};

export const deleteTaskRepo = async (id: string) => {
  return prisma.task.delete({ where: { id } });
};


export const listTasksForUserRepo = (userId: string, filters: {
  status?: string;
  priority?: string;
  sortByDueDate?: 'asc' | 'desc';
}) => {
  return prisma.task.findMany({
    where: {
      OR: [
        { creatorId: userId },
        { assignedToId: userId },
      ],
      status: filters.status ? (filters.status as any) : undefined,
      priority: filters.priority ? (filters.priority as any) : undefined,
    },
    orderBy: filters.sortByDueDate
      ? { dueDate: filters.sortByDueDate }
      : undefined,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};


export const listAllTasksRepo = (filters: {
  status?: string;
  priority?: string;
  sortByDueDate?: 'asc' | 'desc';
}) => {
  return prisma.task.findMany({
    where: {
      status: filters.status ? (filters.status as any) : undefined,
      priority: filters.priority ? (filters.priority as any) : undefined,
    },
    orderBy: filters.sortByDueDate
      ? { dueDate: filters.sortByDueDate }
      : { createdAt: 'desc' },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const listOverdueTasksRepo = (userId: string) => {
  return prisma.task.findMany({
    where: {
      assignedToId: userId,
      status: { not: 'COMPLETED' as any },
      dueDate: { lt: new Date() },
    },
    orderBy: { dueDate: 'asc' },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};