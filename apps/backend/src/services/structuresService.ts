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

export const getStructure = async (id: string): Promise<Structure | null> => {
  return await prisma.structure.findUnique({
    where: { id },
  });
};

export const updateStructurePosition = async (
  id: string,
  x: number,
  y: number,
): Promise<Structure> => {
  return await prisma.structure.update({
    where: { id },
    data: { x, y },
  });
};
