import { Position } from "@happy-little-park/utils";
import { prisma } from "../lib/prisma.js";
import { BugType, ItemType } from "../prisma/prisma/client.js";
import { CreateItemData, ItemDto, UpdateItemData } from "../types/itemDto.js";
import { toItemDto } from "./helpers.js";

const ITEM_TYPES = ["beetle", "leaf_part", "little_rock", "stick"] as const;
const ITEM_TYPES_WEIGHTS = {
  beetle: 0.1,
  leaf_part: 0.5,
  little_rock: 0.8,
  stick: 1,
};

export const getItems = async (authorId: string): Promise<ItemDto[]> => {
  const items = await prisma.item.findMany({
    where: {
      authorId,
    },
  });
  return items.map(toItemDto);
}

export const getItemsByIds = async (authorId: string, itemIds: string[]): Promise<ItemDto[]> => {
  const items = await prisma.item.findMany({
    where: {
      authorId,
      id: { in: itemIds },
    },
  });
  return items.map(toItemDto);
}

export const getItem = async (id: string): Promise<ItemDto | null> => {
  const item = await prisma.item.findUnique({
    where: { id },
  });
  if (!item) {
    return null;
  }
  return toItemDto(item);
}

export const createItem = async (item: CreateItemData): Promise<ItemDto> => {
  const createdItem = await prisma.item.create({
    data: {
      itemType: item.itemType,
      x: item.x,
      y: item.y,
      authorId: item.authorId,
    },
  });
  return toItemDto(createdItem);
}

export const updateItem = async (id: string, item: UpdateItemData): Promise<ItemDto> => {
  const data = item.bugId ? {
    bugId: item.bugId,
    x: null,
    y: null,
    stackId: null,
  } : item.stackId ? {
    bugId: null,
    x: null,
    y: null,
    stackId: item.stackId,
  } : {
    x: item.x,
    y: item.y,
    stackId: null,
    bugId: null,
  }

  const updatedItem = await prisma.item.update({
    where: { id },
    data,
  });
  return toItemDto(updatedItem);
}

export function generateRandomItemType(): ItemType | BugType {
  const seed = Math.random();
  return ITEM_TYPES.find((itemType) => seed < ITEM_TYPES_WEIGHTS[itemType]) ?? "leaf_part";
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
    });
    const remainingItem = await tx.item.update({
      where: { id: itemToKeep.id },
      data: {
        stackId: null,
        x: stackPosition.x,
        y: stackPosition.y,
      },
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
