import {prisma} from '../utils/prisma';

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const createUser = (data: { name: string; email: string; password: string }) => {
  return prisma.user.create({
    data,
  });
};

export const updateUserById = (id: string, data: { name?: string }) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

export const findAllUsers = () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });
};
