import { prisma } from "../lib/prisma.js";
import { User } from "../prisma/prisma/client.js";

export const getUser = async (id: string): Promise<User | undefined> => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  }) ?? undefined;
};

export const updateUser = async (user: User): Promise<User> => {
  return await prisma.user.upsert({
    where: {
      id: user.id,
    },
    create: user,
    update: user,
  });
};
