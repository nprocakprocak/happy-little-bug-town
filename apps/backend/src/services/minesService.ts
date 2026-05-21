import { prisma } from "../lib/prisma.js";
import { Mine } from "../prisma/prisma/client.js";

export const getMines = async (authorId: string): Promise<Mine[]> => {
  return await prisma.mine.findMany({
    where: {
      authorId,
    },
  });
}

export const createFirstMine = async (authorId: string): Promise<Mine> => {
  return await prisma.mine.create({
    data: {
      authorId,
      mineType: "hole",
      x: 5,
      y: 8,
      span: 2,
    },
  });
}
