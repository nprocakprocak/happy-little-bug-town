import { loadAuthEnv } from "../config/authEnv.js";
import { prisma } from "../lib/prisma.js";

export const createSession = async (userId: string): Promise<string> => {
  const { sessionTtlDays } = loadAuthEnv();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + sessionTtlDays);

  await prisma.session.deleteMany({ where: { userId } });

  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt,
    },
  });

  return session.id;
};

export const validateSession = async (
  sessionId: string,
): Promise<string | null> => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return null;
  }

  return session.userId;
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  await prisma.session.deleteMany({
    where: { id: sessionId },
  });
};
