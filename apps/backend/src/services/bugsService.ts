import {
  canDropBugOnStack,
  canStructureAcceptBugDrop,
  isBugFed,
  structureDropRequiresFedBug,
} from "@happy-little-bug-town/utils";

import { AppError } from "../errors/AppError.js";
import { loadOwnedOr404, parseUuidOrThrow } from "../helpers/ownership.js";
import { prisma } from "../lib/prisma.js";
import { toBugDto } from "../mappers/bug.js";
import { toStackOnGridDto } from "../mappers/stack.js";
import { toStructureOnGridDto } from "../mappers/structure.js";
import { BugDto, CreateBugData, UpdateBugData } from "../types/bugDto.js";
import { StackOnGridDto } from "../types/stackDto.js";
import { StructureOnGridDto } from "../types/structureDto.js";
import { getStack } from "./stacksService.js";
import { getStructure } from "./structuresService.js";

export const getBugs = async (authorId: string): Promise<BugDto[]> => {
  const bugs = await prisma.bug.findMany({
    where: { authorId },
    include: { items: { where: { removedAt: null } } },
  });
  return bugs.map(toBugDto);
};

export const getBug = async (id: string): Promise<BugDto | null> => {
  const bug = await prisma.bug.findUnique({
    where: { id },
    include: { items: { where: { removedAt: null } } },
  });
  if (!bug) {
    return null;
  }
  return toBugDto(bug);
};

export const getBugsByIds = async (ids: string[]): Promise<BugDto[]> => {
  if (ids.length === 0) {
    return [];
  }

  const bugs = await prisma.bug.findMany({
    where: { id: { in: ids } },
    include: { items: { where: { removedAt: null } } },
  });
  return bugs.map(toBugDto);
};

export const createBug = async (bug: CreateBugData): Promise<BugDto> => {
  const createdBug = await prisma.bug.create({
    data: {
      bugType: bug.bugType,
      x: bug.x,
      y: bug.y,
      authorId: bug.authorId,
    },
  });
  return toBugDto({ ...createdBug, items: [] });
};

export const updateBug = async (id: string, data: UpdateBugData): Promise<BugDto> => {
  let updateData;
  if (data.stackId) {
    updateData = { stackId: data.stackId, x: null, y: null, structureId: null };
  } else if (data.structureId) {
    updateData = { structureId: data.structureId, x: null, y: null, stackId: null };
  } else {
    updateData = { x: data.x, y: data.y, structureId: null, stackId: null };
  }

  const updatedBug = await prisma.bug.update({
    where: { id },
    data: updateData,
    include: { items: { where: { removedAt: null } } },
  });
  return toBugDto({ ...updatedBug, items: updatedBug.items });
};

export const attachBugToStructure = async (
  bugId: string,
  structureId: string,
  existingBug: BugDto,
  authorId: string,
): Promise<StructureOnGridDto> => {
  const parsedStructureId = parseUuidOrThrow(structureId, "structureId");

  const existingStructure = await loadOwnedOr404(getStructure, parsedStructureId, authorId);
  const structureForDrop = {
    structureType: existingStructure.structureType,
    upgradeLevel: existingStructure.upgradeLevel,
    items: existingStructure.items,
    bugs: existingStructure.bugs,
  };

  if (!canStructureAcceptBugDrop(existingBug, structureForDrop)) {
    throw new AppError(400, "Structure cannot accept this bug");
  }

  if (
    structureDropRequiresFedBug(existingStructure.structureType, existingStructure.upgradeLevel) &&
    !isBugFed(existingBug)
  ) {
    throw new AppError(400, "Bug must be fed before joining structure");
  }

  await updateBug(bugId, { structureId: parsedStructureId });
  const structure = await getStructure(parsedStructureId);
  if (!structure) {
    throw new AppError(500, "Structure not found after updating bug");
  }
  return toStructureOnGridDto(structure);
};

export const attachBugToStack = async (
  bugId: string,
  stackId: string,
  existingBug: BugDto,
  authorId: string,
): Promise<StackOnGridDto> => {
  const parsedStackId = parseUuidOrThrow(stackId, "stackId");
  const existingStack = await loadOwnedOr404(getStack, parsedStackId, authorId);
  if (!canDropBugOnStack(existingBug, existingStack)) {
    throw new AppError(400, "Stack cannot accept this bug");
  }
  if (!isBugFed(existingBug)) {
    throw new AppError(400, "Bug must be fed before joining stack");
  }
  await updateBug(bugId, { stackId: parsedStackId });
  const stack = await getStack(parsedStackId);
  if (!stack) {
    throw new AppError(500, "Stack not found after updating bug");
  }
  return toStackOnGridDto(stack);
};
