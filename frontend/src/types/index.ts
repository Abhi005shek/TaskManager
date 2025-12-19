export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'
  creatorId: string
  assignedToId: string
  creator: User
  assignedTo: User
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  userId: string
  taskId?: string
  createdAt: string
  read: boolean
}

export interface CreateTaskData {
  title: string
  description: string
  dueDate: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  status: 'To Do' | 'In Progress' | 'Review' | 'Completed'
  assignedToId: string
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string
}

export type SocketType = any
