import { Position } from "../types/position.js";
import { prisma } from "../lib/prisma.js";
import { Item } from "../prisma/prisma/client.js";
import { CreateItemDto, ItemDto } from "../types/itemDto.js";
import { isItemStackable, toItemDto } from "./helpers.js";

type ItemUpdateData = Partial<Pick<Item, "x" | "y" | "stackId">>;

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
      x: { not: null },
      y: { not: null },
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

export const createItem = async (item: CreateItemDto): Promise<ItemDto> => {
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

export const updateItem = async (id: string, item: ItemUpdateData): Promise<ItemDto> => {
  const updatedItem = await prisma.item.update({
    where: { id },
    data: {
      x: item.x ?? null,
      y: item.y ?? null,
      stackId: item.stackId ?? null,
    },
  });
  return toItemDto(updatedItem);
}

export async function generateRandomItem(authorId: string, position: Position): Promise<CreateItemDto> {
  const seed = Math.random();
  const itemType = ITEM_TYPES.find((itemType) => seed < ITEM_TYPES_WEIGHTS[itemType]) ?? "leaf_part";
  return {
    itemType,
    stackable: isItemStackable(itemType),
    x: position.x,
    y: position.y,
    authorId,
  };
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
