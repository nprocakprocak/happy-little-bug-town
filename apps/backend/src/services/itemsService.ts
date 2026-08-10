import { Position } from "@happy-little-bug-town/utils";

import { prisma } from "../lib/prisma.js";
import { BugType, ItemType } from "../prisma/prisma/client.js";
import { CreateItemData, ItemDto, UpdateItemData } from "../types/itemDto.js";
import { toItemDto } from "./helpers.js";

const ITEM_TYPES_WEIGHTS = {
  beetle: 0.2,
  root: 0.4,
  leaf_part: 0.6,
  little_rock: 0.8,
  stick: 1,
} as const;
type DiggableItemOrBugType = keyof typeof ITEM_TYPES_WEIGHTS;
const DIGGABLE_TYPES = Object.keys(ITEM_TYPES_WEIGHTS) as DiggableItemOrBugType[];

const itemInclude = { items: true } as const;

export const getItemsOnGrid = async (authorId: string): Promise<ItemDto[]> => {
  const items = await prisma.item.findMany({
    where: {
      authorId,
      x: { not: null },
      y: { not: null },
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
  if (!item) {
    return null;
  }
  return toItemDto(item);
};

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

export function generateRandomItemType(): ItemType | BugType {
  const seed = Math.random();
  return DIGGABLE_TYPES.find((itemType) => seed < ITEM_TYPES_WEIGHTS[itemType]) ?? "leaf_part";
}

export async function takeItemFromStack(stackId: string, position: Position): Promise<ItemDto> {
  return await prisma.$transaction(async (tx) => {
    const item = await tx.item.findFirst({
      where: {
        stackId,
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
      where: { stackId },
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
