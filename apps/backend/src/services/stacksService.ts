import { prisma } from "../lib/prisma.js";
import { ItemType, Stack } from "../prisma/prisma/client.js";

type CreateStackData = Pick<Stack, "itemType" | "x" | "y" | "authorId">;
type ReturnStackData = Stack & { itemsCount: number };
type UpdateStackData = Pick<Stack,  "x" | "y">;

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

export const getStack = async (id: string): Promise<ReturnStackData | null> => {
  const stack = await prisma.stack.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });
  return stack ? { ...stack, itemsCount: stack.items.length } : null;
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

export const updateStack = async (id: string, stack: UpdateStackData): Promise<ReturnStackData> => {
  const updatedStack = await prisma.stack.update({
    where: { id },
    data: stack,
    include: {
      items: true,
    },
  });
  return {
    ...updatedStack,
    itemsCount: updatedStack.items.length,
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

export const mergeStacks = async (
  sourceStackId: string,
  targetStackId: string,
): Promise<ReturnStackData> => {
  return await prisma.$transaction(async (tx) => {
    await tx.item.updateMany({
      where: { stackId: sourceStackId },
      data: { stackId: targetStackId },
    });

    await tx.stack.delete({
      where: { id: sourceStackId },
    });

    const mergedStack = await tx.stack.findUnique({
      where: { id: targetStackId },
      include: { items: true },
    });

    if (!mergedStack) {
      throw new Error("Target stack not found after merge");
    }

    return {
      ...mergedStack,
      itemsCount: mergedStack.items.length,
    };
  });
}
