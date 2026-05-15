import { Position } from "@happy-little-park/types";
import { prisma } from "../lib/prisma.js";
import { Item } from "../prisma/prisma/client.js";

type ItemData = Pick<Item, "itemType" | "x" | "y" | "authorId">;
type ItemUpdateData = Partial<Pick<Item, "x" | "y">>;

const ITEM_TYPES = ["leaf_part", "little_rock", "stick"] as const;
const ITEM_TYPES_WEIGHTS = {
  leaf_part: 0.5,
  little_rock: 0.8,
  stick: 1,
};

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

export const getItems = async (authorId: string): Promise<Item[]> => {
  return await prisma.item.findMany({
    where: {
      authorId,
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
      x: item.x ?? undefined,
      y: item.y ?? undefined,
    },
  });
}
