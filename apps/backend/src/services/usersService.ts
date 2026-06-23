import { prisma } from "../lib/prisma.js";
import { UserDto } from "../types/userDto.js";

export const ensureUser = async (id: string): Promise<void> => {
  await prisma.user.upsert({
    where: { id },
    create: { id },
    update: {},
  });
};

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
    isLinked: user.googleSub !== null,
  };
};
