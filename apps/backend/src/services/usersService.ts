import { prisma } from "../lib/prisma.js";
import { User } from "../prisma/prisma/client.js";
import { UserDto } from "../types/userDto.js";

export const getUser = async (id: string): Promise<UserDto | undefined> => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  if (!user) {
    return undefined;
  }
  return {
    id: user.id,
    name: user.name ?? undefined,
    email: user.email ?? undefined,
  };
};

export const updateUser = async (user: User): Promise<UserDto> => {
  const updatedUser = await prisma.user.upsert({
    where: {
      id: user.id,
    },
    create: user,
    update: user,
  });

  return {
    id: updatedUser.id,
    name: updatedUser.name ?? undefined,
    email: updatedUser.email ?? undefined,
  };
};
