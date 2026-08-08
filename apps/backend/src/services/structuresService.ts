import { ItemType, Position } from "@happy-little-bug-town/utils";

import { prisma } from "../lib/prisma.js";
import { ItemDto } from "../types/itemDto.js";
import { CreateStructureData, StructureDto } from "../types/structureDto.js";
import { toItemDto, toStructureDto } from "./helpers.js";

const structureInclude = { items: true, bugs: true, tools: true } as const;
const itemInclude = { items: true } as const;

export const hasBeetleHouse = async (authorId: string): Promise<boolean> => {
  const count = await prisma.structure.count({
    where: {
      authorId,
      structureType: "beetle_house",
    },
  });
  return count > 0;
};

export const hasWorkshop = async (authorId: string): Promise<boolean> => {
  const count = await prisma.structure.count({
    where: {
      authorId,
      structureType: "workshop",
    },
  });
  return count > 0;
};

export const hasStonemason = async (authorId: string): Promise<boolean> => {
  const count = await prisma.structure.count({
    where: {
      authorId,
      structureType: "stonemason",
    },
  });
  return count > 0;
};

export const hasWoodcutter = async (authorId: string): Promise<boolean> => {
  const count = await prisma.structure.count({
    where: {
      authorId,
      structureType: "woodcutter",
    },
  });
  return count > 0;
};

export const hasKitchen = async (authorId: string): Promise<boolean> => {
  const count = await prisma.structure.count({
    where: {
      authorId,
      structureType: "kitchen",
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
        toolId: null,
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
