import { BugType, ItemType, Position, StructureType } from "@happy-little-bug-town/utils";

import { prisma } from "../lib/prisma.js";
import { toBugDto } from "../mappers/bug.js";
import { toItemDto } from "../mappers/item.js";
import { toStructureDto } from "../mappers/structure.js";
import { BugDto } from "../types/bugDto.js";
import { ItemDto } from "../types/itemDto.js";
import { CreateStructureData, StructureDto } from "../types/structureDto.js";

const structureInclude = { items: true, bugs: true } as const;
const itemInclude = { items: true } as const;

export const hasStructureOfType = async (
  authorId: string,
  structureType: StructureType,
): Promise<boolean> => {
  const count = await prisma.structure.count({
    where: {
      authorId,
      structureType,
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

export const getHole = async (authorId: string): Promise<StructureDto | null> => {
  const structure = await prisma.structure.findFirst({
    where: {
      authorId,
      structureType: "hole",
    },
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

export const transformHoleToAnthill = async (id: string): Promise<StructureDto> => {
  const structure = await prisma.structure.update({
    where: { id },
    data: { structureType: "anthill" },
    include: structureInclude,
  });
  return toStructureDto(structure);
};

export const craftOperationalItemAtStructure = async (
  structureId: string,
  authorId: string,
  outputItemType: ItemType,
  operationalItemIds: string[],
  position: Position,
): Promise<{ item: ItemDto; structure: StructureDto }> => {
  return prisma.$transaction(async (tx) => {
    const craftedItem = await tx.item.create({
      data: {
        itemType: outputItemType,
        x: position.x,
        y: position.y,
        authorId,
      },
      include: itemInclude,
    });

    await tx.item.updateMany({
      where: { id: { in: operationalItemIds } },
      data: {
        structureId: null,
        parentItemId: craftedItem.id,
        x: null,
        y: null,
      },
    });

    const updatedStructure = await tx.structure.findUnique({
      where: { id: structureId },
      include: structureInclude,
    });
    const updatedItem = await tx.item.findUnique({
      where: { id: craftedItem.id },
      include: itemInclude,
    });

    if (!updatedStructure || !updatedItem) {
      throw new Error("Failed to craft operational item at structure");
    }

    return {
      item: toItemDto(updatedItem),
      structure: toStructureDto(updatedStructure),
    };
  });
};

export const craftOperationalBugAtStructure = async (
  structureId: string,
  authorId: string,
  outputBugType: BugType,
  operationalItemIds: string[],
  position: Position,
): Promise<{ bug: BugDto; structure: StructureDto }> => {
  return prisma.$transaction(async (tx) => {
    const craftedBug = await tx.bug.create({
      data: {
        bugType: outputBugType,
        x: position.x,
        y: position.y,
        authorId,
      },
    });

    await tx.item.updateMany({
      where: { id: { in: operationalItemIds } },
      data: {
        structureId: null,
        x: null,
        y: null,
      },
    });

    const updatedStructure = await tx.structure.findUnique({
      where: { id: structureId },
      include: structureInclude,
    });

    if (!updatedStructure) {
      throw new Error("Failed to craft operational bug at structure");
    }

    return {
      bug: toBugDto({ ...craftedBug, items: [] }),
      structure: toStructureDto(updatedStructure),
    };
  });
};
