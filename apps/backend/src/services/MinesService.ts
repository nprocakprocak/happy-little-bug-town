import { prisma } from "../lib/prisma.js";
import { Mine } from "../prisma/prisma/client.js";

export const getMines = async (authorId: string): Promise<Mine[]> => {
  return await prisma.mine.findMany({
    where: {
      authorId,
    },
  });
}
