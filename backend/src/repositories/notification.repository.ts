import {prisma} from '../utils/prisma';

export interface CreateNotificationInput {
  userId: string;
  taskId: string;
  message: string;
  read?: boolean;
}

export const createNotification = async (data: CreateNotificationInput) => {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      taskId: data.taskId,
      message: data.message,
      read: data.read || false,
    },
  });
};

export const getUnreadNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where: {
      userId,
      read: false,
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const markAsRead = async (notificationId: string) => {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
};

export const markAllAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
};