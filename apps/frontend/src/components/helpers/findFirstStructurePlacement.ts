import { Position, Positionable, structureFootprintFits } from "@happy-little-park/utils";

export function findFirstStructurePlacement(
  span: number,
  cols: number,
  rows: number,
  entities: Positionable[],
): Position | null {
  for (let y = 1; y <= rows; y++) {
    for (let x = 1; x <= cols; x++) {
      if (structureFootprintFits({ x, y, span }, cols, rows, entities)) {
        return { x, y };
      }
    }
  }
  return null;
}
