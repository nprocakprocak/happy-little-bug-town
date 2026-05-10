import { Item } from "../../types/item";
import { Mine } from "../../types/mine";
import { positionOverlapsAnything } from "./overlaps";

export function findRandomEmptyPosition(rows: number, cols: number, mines: Mine[], items: Item[]) {
  const emptyPositions = [];

  for (let y = 1; y <= rows; y++) {
    for (let x = 1; x <= cols; x++) {
      if (!positionOverlapsAnything({ x, y }, mines, items)) {
        emptyPositions.push({ x, y });
      }
    }
  }

  return emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
}
