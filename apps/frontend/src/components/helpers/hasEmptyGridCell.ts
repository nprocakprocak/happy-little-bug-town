import { Positionable, positionOverlapsAnyEntity } from "@happy-little-bug-town/utils";

export function hasEmptyGridCell(rows: number, cols: number, entities: Positionable[]): boolean {
  for (let y = 1; y <= rows; y++) {
    for (let x = 1; x <= cols; x++) {
      if (!positionOverlapsAnyEntity({ x, y }, entities)) {
        return true;
      }
    }
  }
  return false;
}
