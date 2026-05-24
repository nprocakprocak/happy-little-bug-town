import { prisma } from "../lib/prisma.js";
import { Bug, Item } from "../prisma/prisma/client.js";
import { BugDto, CreateBugData, UpdateBugData } from "../types/bugDto.js";
import { toBugDto } from "./helpers.js";

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
  const updatedBug = await prisma.bug.update({
    where: { id },
    data: { x: data.x, y: data.y },
    include: { items: true },
  });
  return toBugDto({ ...updatedBug, items: updatedBug.items });
};
