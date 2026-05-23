import { prisma } from "../lib/prisma.js";
import { Bug } from "../prisma/prisma/client.js";
import { BugDto } from "../types/bugDto.js";

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
