import { updateUserById, findUserById } from '../repositories/user.repository';
import { UpdateUserInput } from '../schemas/user.schema';

export const updateCurrentUser = async (userId: string, data: UpdateUserInput) => {
  const existing = await findUserById(userId);
  if (!existing) {
    throw new Error('User not found');
  }

  return updateUserById(userId, data);
};
