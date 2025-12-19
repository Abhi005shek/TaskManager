import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/requireUser';
import { getUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notification.service';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const notifications = await getUnreadNotifications(userId);
   return res.json({ data: notifications });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const notification = await markNotificationAsRead(id);
   return  res.json({ data: notification });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    await markAllNotificationsAsRead(userId);
    res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};