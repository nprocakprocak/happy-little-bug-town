import { Item, Mine, Stack } from "../prisma/prisma/client.js";
import { positionOverlapsAnything } from "./overlaps.js";

export function findRandomEmptyPosition(rows: number, cols: number, mines: Mine[], items: Item[], stacks: Stack[]) {
  const emptyPositions = [];

  for (let y = 1; y <= rows; y++) {
    for (let x = 1; x <= cols; x++) {
      if (!positionOverlapsAnything({ x, y }, mines, items, stacks)) {
        emptyPositions.push({ x, y });
      }
    }
  }

  return emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
}
