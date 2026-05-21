import { prisma } from "../lib/prisma.js";
import { Structure } from "../prisma/prisma/client.js";

export const getStructures = async (authorId: string): Promise<Structure[]> => {
  return await prisma.structure.findMany({
    where: {
      authorId,
    },
  });
};

export const createFirstStructure = async (authorId: string): Promise<Structure> => {
  return await prisma.structure.create({
    data: {
      authorId,
      structureType: "hole",
      x: 5,
      y: 8,
      span: 2,
    },
  });
};
