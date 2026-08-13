import {
  canStructureAcceptBugDrop,
  isBugFed,
  structureDropRequiresFedBug,
} from "@happy-little-bug-town/utils";

import { AppError } from "../errors/AppError.js";
import { loadOwnedOr404, parseUuidOrThrow } from "../helpers/ownership.js";
import { prisma } from "../lib/prisma.js";
import { toBugDto } from "../mappers/bug.js";
import { toStructureOnGridDto } from "../mappers/structure.js";
import { BugDto, CreateBugData, UpdateBugData } from "../types/bugDto.js";
import { StructureOnGridDto } from "../types/structureDto.js";
import { getStructure } from "./structuresService.js";

export const getBugs = async (authorId: string): Promise<BugDto[]> => {
  const bugs = await prisma.bug.findMany({
    where: { authorId },
    include: { items: true },
  });
  return bugs.map(toBugDto);
};

export const getBug = async (id: string): Promise<BugDto | null> => {
  const bug = await prisma.bug.findUnique({
    where: { id },
    include: { items: true },
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
    include: { items: true },
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
  const updateData = data.structureId
    ? { structureId: data.structureId, x: null, y: null }
    : { x: data.x, y: data.y, structureId: null };

  const updatedBug = await prisma.bug.update({
    where: { id },
    data: updateData,
    include: { items: true },
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
    items: existingStructure.items,
    bugs: existingStructure.bugs,
  };

  if (!canStructureAcceptBugDrop(existingBug, structureForDrop)) {
    throw new AppError(400, "Structure cannot accept this bug");
  }

  if (structureDropRequiresFedBug(existingStructure.structureType) && !isBugFed(existingBug)) {
    throw new AppError(400, "Bug must be fed before joining structure");
  }

  await updateBug(bugId, { structureId: parsedStructureId });
  const structure = await getStructure(parsedStructureId);
  if (!structure) {
    throw new AppError(500, "Structure not found after updating bug");
  }
  return toStructureOnGridDto(structure);
};
