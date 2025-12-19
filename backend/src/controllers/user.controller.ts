import { Response } from 'express';
import { AuthRequest } from '../middlewares/requireUser';
import { findUserById, findAllUsers } from '../repositories/user.repository';
import { updateCurrentUser } from '../services/user.services';
import { UpdateUserInput } from '../schemas/user.schema';

export const getMe = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      status: 'fail',
      message: 'Not authenticated',
    });
  }

  const user = await findUserById(userId);

  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found',
    });
  }

  return res.json({
    status: 'success',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
};




export const updateMe = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ status: 'fail', message: 'Not authenticated' });
  }

  const body = req.body as UpdateUserInput;

  try {
    const updated = await updateCurrentUser(userId, body);

    return res.json({
      status: 'success',
      data: {
        id: updated.id,
        name: updated.name,
      },
    });
  } catch (err: any) {
    const message = err.message || 'Update failed';
    const status = message === 'User not found' ? 404 : 400;

    return res.status(status).json({ status: 'fail', message });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await findAllUsers();

    return res.json({
      status: 'success',
      data: users,
    });
  } catch (err: any) {
    const message = err.message || 'Failed to fetch users';

    return res.status(500).json({ status: 'fail', message });
  }
};
