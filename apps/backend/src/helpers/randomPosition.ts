import { Structure, Stack } from "../prisma/prisma/client.js";
import { BugDto } from "../types/bugDto.js";
import { ItemDto } from "../types/itemDto.js";
import { positionOverlapsAnything } from "./overlaps.js";

export function findRandomEmptyPosition(
  rows: number,
  cols: number,
  structures: Structure[],
  items: ItemDto[],
  stacks: Stack[], // todo: create StackDto
  bugs: BugDto[] = [],
) {
  const emptyPositions = [];

  for (let y = 1; y <= rows; y++) {
    for (let x = 1; x <= cols; x++) {
      if (!positionOverlapsAnything({ x, y }, structures, items, stacks, bugs)) {
        emptyPositions.push({ x, y });
      }
    }
  }

  return emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
}
