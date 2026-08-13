import { Bug, Item } from "../prisma/prisma/client.js";
import { BugDto, BugOnGridDto } from "../types/bugDto.js";

export function toBugDto(bug: Bug & { items: Item[] }): BugDto {
  return {
    id: bug.id,
    bugType: bug.bugType,
    x: bug.x,
    y: bug.y,
    authorId: bug.authorId,
    structureId: bug.structureId,
    itemIds: bug.items.map((item) => item.id),
  };
}

export function toBugOnGridDto(bug: BugDto): BugOnGridDto {
  if (bug.x == null || bug.y == null) {
    throw new Error(`Bug ${bug.id} is not on a grid`);
  }

  return {
    id: bug.id,
    bugType: bug.bugType,
    x: bug.x,
    y: bug.y,
    itemIds: bug.itemIds,
  };
}
