import { prisma } from "../lib/prisma.js";
import { ItemType, Mine, Stack } from "../prisma/prisma/client.js";

type CreateStackData = Pick<Stack, "itemType" | "x" | "y" | "authorId">;
type ReturnStackData = Stack & { itemsCount: number };

export const getStacks = async (authorId: string): Promise<ReturnStackData[]> => {
  const stacks = await prisma.stack.findMany({
    where: {
      authorId,
    },
    include: {
      items: true,
    },
  });
  return stacks.map((stack) => ({
    ...stack,
    itemsCount: stack.items.length,
  }));
}

export const createStack = async (stack: CreateStackData): Promise<ReturnStackData> => {
  const createdStack = await prisma.stack.create({
    data: {
      ...stack,
    },
  });
  return {
    ...createdStack,
    itemsCount: 0,
  };
}

export const createStackWithItems = async (stack: CreateStackData, itemIds: string[]): Promise<ReturnStackData> => {
  return await prisma.$transaction(async (tx) => {
    const createdStack = await tx.stack.create({
      data: stack,
    });
    await tx.item.updateMany({
      where: {
        id: {
          in: itemIds,
        },
      },
      data: {
        stackId: createdStack.id,
        x: null,
        y: null,
      },
    });
    return {
      ...createdStack,
      itemsCount: itemIds.length,
    };
  });
}
