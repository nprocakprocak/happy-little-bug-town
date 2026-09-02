import { randomUUID } from "crypto";

import { AppError } from "../errors/AppError.js";
import { prisma } from "../lib/prisma.js";
import { toUserDto } from "../mappers/user.js";
import { UserDto } from "../types/userDto.js";
import { getSessionExpiresAt } from "./sessionService.js";

interface ResetGameResult {
  user: UserDto;
  sessionId: string | null;
}

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

export const resetGame = async (
  currentUserId: string,
  sessionUserId: string | undefined,
): Promise<ResetGameResult> => {
  const newUserId = randomUUID();

  return prisma.$transaction(async (tx) => {
    const currentUser = await tx.user.findUnique({
      where: { id: currentUserId },
    });
    if (!currentUser) {
      throw new AppError(401, "Unauthorized");
    }

    const shouldTransferIdentity =
      currentUser.googleSub !== null && sessionUserId === currentUserId;

    if (shouldTransferIdentity) {
      await tx.user.update({
        where: { id: currentUserId },
        data: { googleSub: null, email: null, name: null },
      });
    }

    const created = await tx.user.create({
      data: shouldTransferIdentity
        ? {
            id: newUserId,
            googleSub: currentUser.googleSub,
            email: currentUser.email,
            name: currentUser.name,
          }
        : { id: newUserId },
    });

    if (!shouldTransferIdentity) {
      return { user: toUserDto(created), sessionId: null };
    }

    await tx.session.deleteMany({ where: { userId: currentUserId } });
    const session = await tx.session.create({
      data: {
        userId: newUserId,
        expiresAt: getSessionExpiresAt(),
      },
    });

    return { user: toUserDto(created), sessionId: session.id };
  });
};
