import {
  BugType,
  isGroundEvolutionStructureType,
  ItemType,
  Position,
  StructureType,
} from "@happy-little-bug-town/utils";

import { AppError } from "../errors/AppError.js";
import { generateRandomItemType } from "../helpers/diggableItems.js";
import { findNearestEmptyPositionForAuthor, lockAuthorGrid } from "../helpers/gridPlacement.js";
import { prisma } from "../lib/prisma.js";
import { toBugDto } from "../mappers/bug.js";
import { toItemDto } from "../mappers/item.js";
import { toStructureDto } from "../mappers/structure.js";
import { BugDto } from "../types/bugDto.js";
import { ItemDto } from "../types/itemDto.js";
import { CreateStructureData, StructureDto, UpdateStructureData } from "../types/structureDto.js";

const notRemoved = { removedAt: null } as const;
const structureInclude = { items: { where: notRemoved }, bugs: true } as const;
const itemInclude = { items: { where: notRemoved } } as const;
const bugInclude = { items: { where: notRemoved } } as const;

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

export const updateStructure = async (
  id: string,
  data: UpdateStructureData,
): Promise<StructureDto> => {
  const structure = await prisma.structure.update({
    where: { id },
    data,
    include: structureInclude,
  });
  return toStructureDto(structure);
};

export const evolveStructureType = async (
  id: string,
  toType: StructureType,
): Promise<StructureDto> => {
  const structure = await prisma.structure.update({
    where: { id },
    data: { structureType: toType },
    include: structureInclude,
  });
  return toStructureDto(structure);
};

export const digAtStructure = async (
  authorId: string,
  structure: StructureDto,
): Promise<ItemDto | BugDto> => {
  if (!isGroundEvolutionStructureType(structure.structureType)) {
    throw new AppError(400, "This structure type cannot be dug");
  }

  return prisma.$transaction(async (tx) => {
    await lockAuthorGrid(tx, authorId);
    const emptyPosition = await findNearestEmptyPositionForAuthor(tx, authorId, structure);
    const itemOrBug = generateRandomItemType(structure.structureType !== "hole");

    if (itemOrBug === "beetle") {
      const createdBug = await tx.bug.create({
        data: {
          bugType: itemOrBug,
          x: emptyPosition.x,
          y: emptyPosition.y,
          authorId,
        },
      });
      return toBugDto({ ...createdBug, items: [] });
    }

    const createdItem = await tx.item.create({
      data: {
        itemType: itemOrBug,
        x: emptyPosition.x,
        y: emptyPosition.y,
        authorId,
      },
      include: itemInclude,
    });
    return toItemDto(createdItem);
  });
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
        bugId: craftedBug.id,
        x: null,
        y: null,
      },
    });

    const updatedStructure = await tx.structure.findUnique({
      where: { id: structureId },
      include: structureInclude,
    });
    const updatedBug = await tx.bug.findUnique({
      where: { id: craftedBug.id },
      include: bugInclude,
    });

    if (!updatedStructure || !updatedBug) {
      throw new Error("Failed to craft operational bug at structure");
    }

    return {
      bug: toBugDto(updatedBug),
      structure: toStructureDto(updatedStructure),
    };
  });
};
