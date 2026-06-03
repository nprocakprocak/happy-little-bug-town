import { prisma } from "../lib/prisma.js";
import { CreateStructureData, StructureDto } from "../types/structureDto.js";
import { BEETLE_HOUSE_SPAN } from "./constants.js";
import { toStructureDto } from "./helpers.js";

const structureInclude = { items: true } as const;

export const hasBeetleHouse = async (authorId: string): Promise<boolean> => {
  const count = await prisma.structure.count({
    where: {
      authorId,
      structureType: "beetle_house",
    },
  });
  return count > 0;
};

export const getStructures = async (authorId: string): Promise<StructureDto[]> => {
  const structures = await prisma.structure.findMany({
    where: {
      authorId,
    },
    include: structureInclude,
  });
  return structures.map(toStructureDto);
};

export const createStructure = async (data: CreateStructureData): Promise<StructureDto> => {
  const structure = await prisma.structure.create({
    data: {
      authorId: data.authorId,
      structureType: data.structureType,
      x: data.x,
      y: data.y,
      span: BEETLE_HOUSE_SPAN,
    },
    include: structureInclude,
  });
  return toStructureDto(structure);
};

export const createFirstStructure = async (authorId: string): Promise<StructureDto> => {
  const structure = await prisma.structure.create({
    data: {
      authorId,
      structureType: "hole",
      x: 5,
      y: 8,
      span: 2,
    },
    include: structureInclude,
  });
  return toStructureDto(structure);
};

export const getStructure = async (id: string): Promise<StructureDto | null> => {
  const structure = await prisma.structure.findUnique({
    where: { id },
    include: structureInclude,
  });
  if (!structure) {
    return null;
  }
  return toStructureDto(structure);
};

export const updateStructurePosition = async (
  id: string,
  x: number,
  y: number,
): Promise<StructureDto> => {
  const structure = await prisma.structure.update({
    where: { id },
    data: { x, y },
    include: structureInclude,
  });
  return toStructureDto(structure);
};
