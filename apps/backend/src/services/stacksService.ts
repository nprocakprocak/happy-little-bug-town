import { prisma } from "../lib/prisma.js";
import { Stack } from "../prisma/prisma/client.js";
import { StackDto } from "../types/stackDto.js";
import { toStackDto } from "./helpers.js";

const stackInclude = { items: true } as const;

type CreateStackData = Pick<Stack, "itemType" | "x" | "y" | "authorId">;
type UpdateStackData = Pick<Stack, "x" | "y">;

export const getStacks = async (authorId: string): Promise<StackDto[]> => {
  const stacks = await prisma.stack.findMany({
    where: {
      authorId,
    },
    include: stackInclude,
  });
  return stacks.map(toStackDto);
};

export const getStack = async (id: string): Promise<StackDto | null> => {
  const stack = await prisma.stack.findUnique({
    where: { id },
    include: stackInclude,
  });
  return stack ? toStackDto(stack) : null;
};

export const createStack = async (stack: CreateStackData): Promise<StackDto> => {
  const createdStack = await prisma.stack.create({
    data: {
      ...stack,
    },
    include: stackInclude,
  });
  return toStackDto(createdStack);
};

export const updateStack = async (id: string, stack: UpdateStackData): Promise<StackDto> => {
  const updatedStack = await prisma.stack.update({
    where: { id },
    data: stack,
    include: stackInclude,
  });
  return toStackDto(updatedStack);
};

export const createStackWithItems = async (
  stack: CreateStackData,
  itemIds: string[],
): Promise<StackDto> => {
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
    const stackWithItems = await tx.stack.findUnique({
      where: { id: createdStack.id },
      include: stackInclude,
    });
    if (!stackWithItems) {
      throw new Error("Stack not found after creating with items");
    }
    return toStackDto(stackWithItems);
  });
};

export const mergeStacks = async (
  sourceStackId: string,
  targetStackId: string,
): Promise<StackDto> => {
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
      include: stackInclude,
    });

    if (!mergedStack) {
      throw new Error("Target stack not found after merge");
    }

    return toStackDto(mergedStack);
  });
};
