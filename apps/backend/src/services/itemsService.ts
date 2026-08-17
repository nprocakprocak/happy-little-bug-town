import {
  BEETLE_MAX_LEAF_PARTS,
  canDiscardItemOnStructure,
  canDropItemOnItem,
  canDropItemOnStructure,
  canStackItemType,
  Position,
} from "@happy-little-bug-town/utils";

import { AppError } from "../errors/AppError.js";
import { loadOwnedOr404, parseUuidOrThrow } from "../helpers/ownership.js";
import { prisma } from "../lib/prisma.js";
import { toBugOnGridDto } from "../mappers/bug.js";
import { toItemDto, toItemOnGridDto } from "../mappers/item.js";
import { toStackOnGridDto } from "../mappers/stack.js";
import { toStructureOnGridDto } from "../mappers/structure.js";
import { BugOnGridDto } from "../types/bugDto.js";
import { CreateItemData, ItemDto, ItemOnGridDto, UpdateItemData } from "../types/itemDto.js";
import { StackOnGridDto } from "../types/stackDto.js";
import { StructureOnGridDto } from "../types/structureDto.js";
import { getBug } from "./bugsService.js";
import { getStack } from "./stacksService.js";
import { getStructure } from "./structuresService.js";

const notRemoved = { removedAt: null } as const;
const itemInclude = { items: { where: notRemoved } } as const;

export const getItemsOnGrid = async (authorId: string): Promise<ItemDto[]> => {
  const items = await prisma.item.findMany({
    where: {
      authorId,
      x: { not: null },
      y: { not: null },
      ...notRemoved,
    },
    include: itemInclude,
  });
  return items.map(toItemDto);
};

export const getItemsByIds = async (authorId: string, itemIds: string[]): Promise<ItemDto[]> => {
  const items = await prisma.item.findMany({
    where: {
      authorId,
      id: { in: itemIds },
      ...notRemoved,
    },
    include: itemInclude,
  });
  return items.map(toItemDto);
};

export const getItem = async (id: string): Promise<ItemDto | null> => {
  const item = await prisma.item.findUnique({
    where: { id },
    include: itemInclude,
  });
  if (!item || item.removedAt) {
    return null;
  }
  return toItemDto(item);
};

const PARENT_CHAIN_DEPTH_LIMIT = 32;

export const hasParentCycle = async (itemId: string, parentItemId: string): Promise<boolean> => {
  let currentId: string | null = parentItemId;

  for (let depth = 0; depth < PARENT_CHAIN_DEPTH_LIMIT; depth++) {
    if (currentId == null) {
      return false;
    }
    if (currentId === itemId) {
      return true;
    }

    const parent: { parentItemId: string | null } | null = await prisma.item.findUnique({
      where: { id: currentId },
      select: { parentItemId: true },
    });
    if (!parent) {
      return false;
    }

    currentId = parent.parentItemId;
  }

  return true;
};

export function isItemFreeOnGrid(item: ItemDto): boolean {
  return (
    item.stackId == null &&
    item.bugId == null &&
    item.structureId == null &&
    item.parentItemId == null &&
    item.x != null &&
    item.y != null
  );
}

export const createItem = async (item: CreateItemData): Promise<ItemDto> => {
  const createdItem = await prisma.item.create({
    data: {
      itemType: item.itemType,
      x: item.x,
      y: item.y,
      authorId: item.authorId,
    },
    include: itemInclude,
  });
  return toItemDto(createdItem);
};

export const updateItem = async (id: string, item: UpdateItemData): Promise<ItemDto> => {
  let data;

  if (item.bugId) {
    data = {
      bugId: item.bugId,
      x: null,
      y: null,
      stackId: null,
      structureId: null,
      parentItemId: null,
    };
  } else if (item.structureId) {
    data = {
      structureId: item.structureId,
      x: null,
      y: null,
      stackId: null,
      bugId: null,
      parentItemId: null,
    };
  } else if (item.stackId) {
    data = {
      bugId: null,
      structureId: null,
      parentItemId: null,
      x: null,
      y: null,
      stackId: item.stackId,
    };
  } else if (item.parentItemId) {
    data = {
      parentItemId: item.parentItemId,
      x: null,
      y: null,
      stackId: null,
      bugId: null,
      structureId: null,
    };
  } else {
    data = {
      x: item.x,
      y: item.y,
      stackId: null,
      bugId: null,
      structureId: null,
      parentItemId: null,
    };
  }

  const updatedItem = await prisma.item.update({
    where: { id },
    data,
    include: itemInclude,
  });
  return toItemDto(updatedItem);
};

export const discardItem = async (id: string): Promise<void> => {
  await prisma.item.update({
    where: { id },
    data: {
      removedAt: new Date(),
      x: null,
      y: null,
      stackId: null,
      bugId: null,
      structureId: null,
      parentItemId: null,
    },
  });
};

export const discardItemIntoStructure = async (
  itemId: string,
  structureId: unknown,
  authorId: string,
): Promise<void> => {
  const parsedStructureId = parseUuidOrThrow(structureId, "structureId");
  const existingStructure = await loadOwnedOr404(getStructure, parsedStructureId, authorId);
  if (!canDiscardItemOnStructure(existingStructure)) {
    throw new AppError(400, "Item cannot be discarded into structure");
  }

  await discardItem(itemId);
};

export const attachItemToParent = async (
  itemId: string,
  parentItemId: string,
  existingItem: ItemDto,
  authorId: string,
): Promise<ItemOnGridDto> => {
  const parsedParentItemId = parseUuidOrThrow(parentItemId, "parentItemId");
  if (itemId === parsedParentItemId) {
    throw new AppError(400, "Item cannot be added to itself");
  }
  if (await hasParentCycle(itemId, parsedParentItemId)) {
    throw new AppError(400, "Item cannot be added to its descendant");
  }

  const parentItem = await loadOwnedOr404(getItem, parsedParentItemId, authorId);
  if (!canDropItemOnItem(existingItem, parentItem)) {
    throw new AppError(400, "Item cannot be added to item");
  }

  await updateItem(itemId, { parentItemId: parsedParentItemId });
  const updatedParentItem = await getItem(parsedParentItemId);
  if (!updatedParentItem) {
    throw new AppError(500, "Parent item not found after updating item");
  }
  return toItemOnGridDto(updatedParentItem);
};

export const attachItemToStructure = async (
  itemId: string,
  structureId: string,
  existingItem: ItemDto,
  authorId: string,
): Promise<StructureOnGridDto> => {
  const parsedStructureId = parseUuidOrThrow(structureId, "structureId");

  const existingStructure = await loadOwnedOr404(getStructure, parsedStructureId, authorId);
  if (!canDropItemOnStructure(existingItem, existingStructure)) {
    throw new AppError(400, "Item cannot be added to structure");
  }

  await updateItem(itemId, { structureId: parsedStructureId });
  const structure = await getStructure(parsedStructureId);
  if (!structure) {
    throw new AppError(500, "Structure not found after updating item");
  }
  return toStructureOnGridDto(structure);
};

export const attachItemToBug = async (
  itemId: string,
  bugId: string,
  existingItem: ItemDto,
  authorId: string,
): Promise<BugOnGridDto> => {
  const parsedBugId = parseUuidOrThrow(bugId, "bugId");
  if (existingItem.itemType !== "leaf_part") {
    throw new AppError(400, "Only leaf parts can be given to bugs");
  }

  const existingBug = await loadOwnedOr404(getBug, parsedBugId, authorId);
  if (existingBug.bugType !== "beetle") {
    throw new AppError(400, "Only beetles can carry leaf parts");
  }
  if (existingBug.x == null || existingBug.y == null) {
    throw new AppError(400, "Bug must be on the grid");
  }
  if (existingBug.itemIds.length >= BEETLE_MAX_LEAF_PARTS) {
    throw new AppError(400, "Beetle is already full");
  }

  await updateItem(itemId, { bugId: parsedBugId });
  const bug = await getBug(parsedBugId);
  if (!bug) {
    throw new AppError(500, "Bug not found after updating item");
  }
  return toBugOnGridDto(bug);
};

export const attachItemToStack = async (
  itemId: string,
  stackId: string,
  existingItem: ItemDto,
  authorId: string,
): Promise<StackOnGridDto> => {
  const parsedStackId = parseUuidOrThrow(stackId, "stackId");

  const existingStack = await loadOwnedOr404(getStack, parsedStackId, authorId);
  if (existingItem.itemType !== existingStack.itemType) {
    throw new AppError(400, "Item type must match stack type");
  }

  const itemsOnGrid = await getItemsOnGrid(authorId);
  if (!canStackItemType(existingItem.itemType, itemsOnGrid)) {
    throw new AppError(400, "Item cannot be stacked");
  }

  await updateItem(itemId, { stackId: parsedStackId });
  const stack = await getStack(parsedStackId);
  if (!stack) {
    throw new AppError(500, "Stack not found after updating item");
  }
  return toStackOnGridDto(stack);
};

export async function takeItemFromStack(stackId: string, position: Position): Promise<ItemDto> {
  return await prisma.$transaction(async (tx) => {
    const item = await tx.item.findFirst({
      where: {
        stackId,
        ...notRemoved,
      },
    });
    if (!item) {
      throw new Error(`Item not found in stack ${stackId} when extracting`);
    }
    const updatedItem = await tx.item.update({
      where: { id: item.id },
      data: {
        stackId: null,
        x: position.x,
        y: position.y,
      },
      include: itemInclude,
    });
    return toItemDto(updatedItem);
  });
}

export async function dissolveStack(
  stackId: string,
  stackPosition: Position,
  randomPosition: Position,
): Promise<{ extractedItem: ItemDto; remainingItem: ItemDto }> {
  return await prisma.$transaction(async (tx) => {
    const stackItems = await tx.item.findMany({
      where: { stackId, ...notRemoved },
    });
    if (stackItems.length !== 2) {
      throw new Error(`Expected 2 items in stack ${stackId} when dissolving`);
    }

    const itemToExtract = stackItems[0];
    const itemToKeep = stackItems[1];

    const extractedItem = await tx.item.update({
      where: { id: itemToExtract.id },
      data: {
        stackId: null,
        x: randomPosition.x,
        y: randomPosition.y,
      },
      include: itemInclude,
    });
    const remainingItem = await tx.item.update({
      where: { id: itemToKeep.id },
      data: {
        stackId: null,
        x: stackPosition.x,
        y: stackPosition.y,
      },
      include: itemInclude,
    });
    await tx.stack.delete({
      where: { id: stackId },
    });

    return {
      extractedItem: toItemDto(extractedItem),
      remainingItem: toItemDto(remainingItem),
    };
  });
}
