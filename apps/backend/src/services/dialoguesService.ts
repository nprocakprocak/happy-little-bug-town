import { isOnceDialogueId, OnceDialogueId } from "@happy-little-bug-town/utils";

import { prisma } from "../lib/prisma.js";

export const getVisitedDialogueIds = async (authorId: string): Promise<OnceDialogueId[]> => {
  const visitedDialogues = await prisma.visitedDialogue.findMany({
    where: { authorId },
    select: { dialogueId: true },
  });
  return visitedDialogues.map((visited) => visited.dialogueId).filter(isOnceDialogueId);
};

export const markDialogueVisited = async (
  authorId: string,
  dialogueId: OnceDialogueId,
): Promise<OnceDialogueId[]> => {
  await prisma.visitedDialogue.upsert({
    where: {
      authorId_dialogueId: { authorId, dialogueId },
    },
    create: { authorId, dialogueId },
    update: {},
  });
  return getVisitedDialogueIds(authorId);
};
