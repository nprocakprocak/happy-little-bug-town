import {
  BugType,
  canDemolishStructure,
  canDigAtStructureType,
  getHouseOccupants,
  getHouseSourceBugType,
  isInfiniteSource,
  ItemType,
  pickMostFedBug,
  Position,
  StructureType,
} from "@happy-little-bug-town/utils";

import { AppError } from "../errors/AppError.js";
import { getDemolishResultingUpgradeLevel, getNextDemolishTarget } from "../helpers/demolition.js";
import { generateDiggableItem } from "../helpers/diggableItems.js";
import {
  findNearestEmptyPositionForAuthor,
  getOwnedDiggableInventory,
  getPositionedEntitiesOnGrid,
  lockAuthorGrid,
} from "../helpers/gridPlacement.js";
import { prisma } from "../lib/prisma.js";
import { toBugDto } from "../mappers/bug.js";
import { toItemDto } from "../mappers/item.js";
import { toStructureDto } from "../mappers/structure.js";
import { BugDto } from "../types/bugDto.js";
import { ItemDto } from "../types/itemDto.js";
import { CreateStructureData, StructureDto, UpdateStructureData } from "../types/structureDto.js";

const notRemoved = { removedAt: null };
const structureInclude = {
  items: { where: notRemoved },
  bugs: { where: notRemoved },
};
const itemInclude = { items: { where: notRemoved } };
const bugInclude = { items: { where: notRemoved } };

export const hasStructureOfType = async (
  authorId: string,
  structureType: StructureType,
): Promise<boolean> => {
  const count = await prisma.structure.count({
    where: {
      authorId,
      structureType,
      ...notRemoved,
    },
  });
  return count > 0;
};

export const getStructures = async (authorId: string): Promise<StructureDto[]> => {
  const structures = await prisma.structure.findMany({
    where: {
      authorId,
      ...notRemoved,
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
  if (!structure || structure.removedAt) {
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
  if (!canDigAtStructureType(structure.structureType)) {
    throw new AppError(400, "This structure type cannot be dug");
  }

  return prisma.$transaction(async (tx) => {
    await lockAuthorGrid(tx, authorId);
    const [entities, inventory] = await Promise.all([
      getPositionedEntitiesOnGrid(tx, authorId),
      getOwnedDiggableInventory(tx, authorId),
    ]);
    const emptyPosition = await findNearestEmptyPositionForAuthor(structure, entities);
    const itemOrBug = generateDiggableItem(
      structure.structureType,
      inventory.items,
      inventory.bugs,
    );

    if (itemOrBug === "beetle" || itemOrBug === "greenfly") {
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
  operationalBugIds: string[],
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

    if (operationalItemIds.length > 0) {
      await tx.item.updateMany({
        where: { id: { in: operationalItemIds } },
        data: {
          structureId: null,
          parentItemId: craftedItem.id,
          x: null,
          y: null,
        },
      });
    }

    if (operationalBugIds.length > 0) {
      await tx.bug.updateMany({
        where: { id: { in: operationalBugIds } },
        data: {
          removedAt: new Date(),
          structureId: null,
          stackId: null,
          x: null,
          y: null,
        },
      });
    }

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
  operationalBugIds: string[],
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

    if (operationalItemIds.length > 0) {
      await tx.item.updateMany({
        where: { id: { in: operationalItemIds } },
        data: {
          structureId: null,
          bugId: craftedBug.id,
          x: null,
          y: null,
        },
      });
    }

    if (operationalBugIds.length > 0) {
      await tx.bug.updateMany({
        where: { id: { in: operationalBugIds } },
        data: {
          removedAt: new Date(),
          structureId: null,
          stackId: null,
          x: null,
          y: null,
        },
      });
    }

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

export const demolishAtStructure = async (
  authorId: string,
  structure: StructureDto,
): Promise<{ item: ItemDto | null; bug: BugDto | null; structure: StructureDto | null }> => {
  return prisma.$transaction(async (tx) => {
    await lockAuthorGrid(tx, authorId);

    const latest = await tx.structure.findUnique({
      where: { id: structure.id },
      include: structureInclude,
    });
    if (!latest || latest.removedAt || latest.authorId !== authorId) {
      throw new AppError(404, "Not found");
    }

    const itemsOnGrid = await tx.item.findMany({
      where: {
        authorId,
        x: { not: null },
        y: { not: null },
        ...notRemoved,
      },
      include: itemInclude,
    });
    if (!canDemolishStructure(latest, itemsOnGrid)) {
      throw new AppError(400, "This structure cannot be demolished");
    }

    if (getHouseOccupants(latest).length > 0) {
      throw new AppError(400, "This house still has inhabitants");
    }

    const structureForDemolish = toStructureDto(latest);
    const target = getNextDemolishTarget(structureForDemolish);

    if (target.kind === "structure") {
      await tx.structure.update({
        where: { id: structure.id },
        data: { removedAt: new Date() },
      });
      return { item: null, bug: null, structure: null };
    }

    const remainingAfterExtract = {
      ...structureForDemolish,
      items: structureForDemolish.items.filter((item) => item.id !== target.id),
      bugs: structureForDemolish.bugs.filter((bug) => bug.id !== target.id),
    };
    const isLastEntity =
      remainingAfterExtract.items.length === 0 && remainingAfterExtract.bugs.length === 0;
    const nextUpgradeLevel = getDemolishResultingUpgradeLevel(remainingAfterExtract);

    if (isLastEntity) {
      await tx.structure.update({
        where: { id: structure.id },
        data: { removedAt: new Date() },
      });
    } else if (nextUpgradeLevel !== latest.upgradeLevel) {
      await tx.structure.update({
        where: { id: structure.id },
        data: { upgradeLevel: nextUpgradeLevel },
      });
    }

    const entities = await getPositionedEntitiesOnGrid(tx, authorId);
    const emptyPosition = await findNearestEmptyPositionForAuthor(
      {
        x: latest.x,
        y: latest.y,
        structureType: latest.structureType,
      },
      entities,
    );

    if (target.kind === "item") {
      const updatedItem = await tx.item.update({
        where: { id: target.id },
        data: {
          structureId: null,
          x: emptyPosition.x,
          y: emptyPosition.y,
        },
        include: itemInclude,
      });
      const updatedStructure = isLastEntity
        ? null
        : await tx.structure.findUnique({
            where: { id: structure.id },
            include: structureInclude,
          });

      return {
        item: toItemDto(updatedItem),
        bug: null,
        structure:
          updatedStructure && !updatedStructure.removedAt ? toStructureDto(updatedStructure) : null,
      };
    }

    const updatedBug = await tx.bug.update({
      where: { id: target.id },
      data: {
        structureId: null,
        stackId: null,
        x: emptyPosition.x,
        y: emptyPosition.y,
      },
      include: bugInclude,
    });
    const updatedStructure = isLastEntity
      ? null
      : await tx.structure.findUnique({
          where: { id: structure.id },
          include: structureInclude,
        });

    return {
      item: null,
      bug: toBugDto(updatedBug),
      structure:
        updatedStructure && !updatedStructure.removedAt ? toStructureDto(updatedStructure) : null,
    };
  });
};

export const extractOccupantFromStructure = async (
  authorId: string,
  structure: StructureDto,
): Promise<{ bug: BugDto; structure: StructureDto; generated: boolean }> => {
  const sourceBugType = getHouseSourceBugType(structure.structureType);
  if (!sourceBugType) {
    throw new AppError(400, "This structure cannot extract occupants");
  }

  return prisma.$transaction(async (tx) => {
    await lockAuthorGrid(tx, authorId);
    const latest = await tx.structure.findUniqueOrThrow({
      where: { id: structure.id },
      include: {
        items: { where: notRemoved },
        bugs: {
          where: notRemoved,
          include: { items: { where: notRemoved } },
        },
      },
    });
    const occupants = getHouseOccupants(latest);
    if (occupants.length === 0) {
      throw new AppError(400, "No occupants in house");
    }

    const entities = await getPositionedEntitiesOnGrid(tx, authorId);
    const position = await findNearestEmptyPositionForAuthor(latest, entities);
    const generated = isInfiniteSource(occupants.length);
    const occupantToExtract = pickMostFedBug(occupants);
    const updatedBug = await tx.bug.update({
      where: { id: occupantToExtract.id },
      data: {
        x: position.x,
        y: position.y,
        structureId: null,
        stackId: null,
      },
      include: bugInclude,
    });

    if (generated) {
      await tx.bug.create({
        data: {
          bugType: sourceBugType,
          structureId: structure.id,
          authorId,
        },
      });
    }

    const updatedStructure = await tx.structure.findUniqueOrThrow({
      where: { id: structure.id },
      include: structureInclude,
    });

    return {
      bug: toBugDto(updatedBug),
      structure: toStructureDto(updatedStructure),
      generated,
    };
  });
};
