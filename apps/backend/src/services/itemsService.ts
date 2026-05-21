import { Position } from "../types/position.js";
import { prisma } from "../lib/prisma.js";
import { Item } from "../prisma/prisma/client.js";

type ItemData = Pick<Item, "itemType" | "x" | "y" | "authorId">;
type ItemUpdateData = Partial<Pick<Item, "x" | "y" | "stackId">>;

const ITEM_TYPES = ["beetle", "leaf_part", "little_rock", "stick"] as const;
const ITEM_TYPES_WEIGHTS = {
  beetle: 0.1,
  leaf_part: 0.5,
  little_rock: 0.8,
  stick: 1,
};

export const getItems = async (authorId: string): Promise<Item[]> => {
  return await prisma.item.findMany({
    where: {
      authorId,
      x: { not: null },
      y: { not: null },
    },
  });
}

export const getItemByIds = async (authorId: string, itemIds: string[]): Promise<Item[]> => {
  return await prisma.item.findMany({
    where: {
      authorId,
      id: { in: itemIds },
    },
  });
}

export const getItem = async (id: string): Promise<Item | null> => {
  return await prisma.item.findUnique({
    where: { id },
  });
}

export const createItem = async (item: ItemData): Promise<Item> => {
  return await prisma.item.create({
    data: item,
  });
}

export const updateItem = async (id: string, item: ItemUpdateData): Promise<Item> => {
  return await prisma.item.update({
    where: { id },
    data: {
      x: item.x ?? null,
      y: item.y ?? null,
      stackId: item.stackId ?? null,
    },
  });
}

export async function generateRandomItem(authorId: string, position: Position): Promise<ItemData> {
  const seed = Math.random();
  const itemType = ITEM_TYPES.find((itemType) => seed < ITEM_TYPES_WEIGHTS[itemType]) ?? "leaf_part";
  return {
    itemType,
    x: position.x,
    y: position.y,
    authorId,
  };
}

export async function takeItemFromStack(stackId: string, position: Position): Promise<ItemData> {
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
    return updatedItem;
  });
}
