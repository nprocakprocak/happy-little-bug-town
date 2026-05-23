import { prisma } from "../lib/prisma.js";
import { Bug } from "../prisma/prisma/client.js";
import { BugDto, CreateBugData, UpdateBugData } from "../types/bugDto.js";

function toBugDto(bug: Bug): BugDto {
  return {
    id: bug.id,
    bugType: bug.bugType,
    x: bug.x,
    y: bug.y,
    authorId: bug.authorId,
    structureId: bug.structureId,
  };
}

export const getBugs = async (authorId: string): Promise<BugDto[]> => {
  const bugs = await prisma.bug.findMany({
    where: { authorId },
  });
  return bugs.map(toBugDto);
};

export const getBug = async (id: string): Promise<BugDto | null> => {
  const bug = await prisma.bug.findUnique({
    where: { id },
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
  return toBugDto(createdBug);
};

export const updateBug = async (id: string, data: UpdateBugData): Promise<BugDto> => {
  const updatedBug = await prisma.bug.update({
    where: { id },
    data: { x: data.x, y: data.y },
  });
  return toBugDto(updatedBug);
};
