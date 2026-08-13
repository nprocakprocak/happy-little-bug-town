import { prisma } from "../lib/prisma.js";
import { toUserDto } from "../mappers/user.js";
import { UserDto } from "../types/userDto.js";

export const ensureUser = async (id: string): Promise<UserDto> => {
  await prisma.user.upsert({
    where: { id },
    create: { id },
    update: {},
  });
  const user = await getUser(id);
  if (!user) {
    throw new Error("Failed to ensure user");
  }
  return user;
};

export const getUser = async (id: string): Promise<UserDto | null> => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  if (!user) {
    return null;
  }
  return toUserDto(user);
};
