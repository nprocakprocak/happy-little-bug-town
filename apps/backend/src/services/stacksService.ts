import { canDropBugOnStack } from "@happy-little-bug-town/utils";

import { prisma } from "../lib/prisma.js";
import { toBugDto } from "../mappers/bug.js";
import { toStackDto } from "../mappers/stack.js";
import { Stack } from "../prisma/prisma/client.js";
import { BugDto } from "../types/bugDto.js";
import { StackDto } from "../types/stackDto.js";

const stackInclude = { items: { where: { removedAt: null } }, bugs: true } as const;

type CreateStackData = Pick<Stack, "itemType" | "x" | "y" | "authorId">;
type UpdateStackData = Pick<Stack, "x" | "y">;

export class StackItemsUnavailableError extends Error {
  constructor() {
    super("Some items are not available for stacking");
    this.name = "StackItemsUnavailableError";
  }
}

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
    const updateResult = await tx.item.updateMany({
      where: {
        id: {
          in: itemIds,
        },
        authorId: stack.authorId,
        stackId: null,
        bugId: null,
        structureId: null,
        parentItemId: null,
        removedAt: null,
        x: { not: null },
        y: { not: null },
      },
      data: {
        stackId: createdStack.id,
        x: null,
        y: null,
      },
    });
    if (updateResult.count !== itemIds.length) {
      throw new StackItemsUnavailableError();
    }
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
): Promise<{ stack: StackDto; releasedBugs: BugDto[] }> => {
  return await prisma.$transaction(async (tx) => {
    const sourceStack = await tx.stack.findUniqueOrThrow({
      where: { id: sourceStackId },
    });
    const targetBugs = await tx.bug.findMany({
      where: { stackId: targetStackId },
      select: { bugType: true },
    });
    const sourceBugs = await tx.bug.findMany({
      where: { stackId: sourceStackId },
      include: { items: { where: { removedAt: null } } },
    });
    const shouldTransferSourceBugs =
      sourceBugs.length === 1 && canDropBugOnStack(sourceBugs[0], { bugs: targetBugs });
    const shouldReleaseSourceBugs = sourceBugs.length > 0 && !shouldTransferSourceBugs;

    await tx.item.updateMany({
      where: { stackId: sourceStackId },
      data: { stackId: targetStackId },
    });
    await tx.bug.updateMany({
      where: { stackId: sourceStackId },
      data: shouldReleaseSourceBugs
        ? { stackId: null, x: sourceStack.x, y: sourceStack.y }
        : { stackId: targetStackId },
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

    return {
      stack: toStackDto(mergedStack),
      releasedBugs: shouldReleaseSourceBugs
        ? sourceBugs.map((bug) =>
            toBugDto({ ...bug, stackId: null, x: sourceStack.x, y: sourceStack.y }),
          )
        : [],
    };
  });
};
