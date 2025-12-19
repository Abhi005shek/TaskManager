import { z } from 'zod';

const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
const statusEnum = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']);

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1),
    dueDate: z.string().datetime(),
    priority: priorityEnum,
    status: statusEnum.optional().default('TODO'),
    assignedToId: z.string().optional().nullable(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().min(1).optional(),
    dueDate: z.string().datetime().optional(),
    priority: priorityEnum.optional(),
    status: statusEnum.optional(),
    assignedToId: z.string().nullable().optional(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
