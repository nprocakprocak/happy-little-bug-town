import {
  Position,
  Positionable,
  Spannable,
  structureFootprintFits,
} from "@happy-little-bug-town/utils";

export function findFirstStructurePlacement(
  spannable: Spannable,
  cols: number,
  rows: number,
  entities: Positionable[],
): Position | null {
  for (let y = 1; y <= rows; y++) {
    for (let x = 1; x <= cols; x++) {
      if (structureFootprintFits({ x, y, ...spannable }, cols, rows, entities)) {
        return { x, y };
      }
    }
  }
  return null;
}
