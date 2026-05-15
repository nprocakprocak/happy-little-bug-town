import { Position } from "@happy-little-park/types";
import { prisma } from "../lib/prisma.js";
import { Item } from "../prisma/prisma/client.js";

type ItemData = Pick<Item, "itemType" | "x" | "y" | "authorId">;

export async function generateRandomItem(authorId: string, position: Position): Promise<ItemData> {
  const itemType = Math.random() < 0.5 ? "leaf_part" : "little_rock";
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

export const createItem = async (item: ItemData): Promise<Item> => {
  return await prisma.item.create({
    data: item,
  });
}
