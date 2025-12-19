import { io } from '../index';
import * as notificationModel from '../repositories/notification.repository';

export const notifyTaskAssignment = async (
  userId: string,
  taskId: string,
  taskTitle: string
) => {
  console.log('Creating notification for user:', userId, 'task:', taskId, 'title:', taskTitle);
  
  const message = `You have been assigned to task: ${taskTitle}`;
  
  const notification = await notificationModel.createNotification({
    userId,
    taskId,
    message
  });

  console.log('Notification created:', notification);
  console.log('Emitting to room:', userId);
  
  io.to(userId).emit('newNotification', notification);

  console.log('Notification emitted successfully');

  return notification;
};

export const getUnreadNotifications = async (userId: string) => {
  return notificationModel.getUnreadNotifications(userId);
};

export const markNotificationAsRead = async (notificationId: string) => {
  return notificationModel.markAsRead(notificationId);
};

export const markAllNotificationsAsRead = async (userId: string) => {
  return notificationModel.markAllAsRead(userId);
};