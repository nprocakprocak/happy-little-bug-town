import { Positionable, positionOverlapsAnyEntity } from "@happy-little-park/utils";

export function findRandomEmptyPosition(
  rows: number,
  cols: number,
  entities: Positionable[],
) {
  const emptyPositions = [];

  for (let y = 1; y <= rows; y++) {
    for (let x = 1; x <= cols; x++) {
      if (!positionOverlapsAnyEntity({ x, y }, entities)) {
        emptyPositions.push({ x, y });
      }
    }
  }

  return emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
}
