import { Position, Positionable, positionOverlapsAnyEntity } from "@happy-little-park/utils";

function minManhattanDistanceToEntity(position: Position, entity: Positionable): number {
  const span = entity.span ?? 1;
  let minDistance = Infinity;

  for (let dx = 0; dx < span; dx++) {
    for (let dy = 0; dy < span; dy++) {
      const cellX = entity.x + dx;
      const cellY = entity.y + dy;
      const distance = Math.abs(position.x - cellX) + Math.abs(position.y - cellY);
      minDistance = Math.min(minDistance, distance);
    }
  }

  return minDistance;
}

export function findNearestEmptyPosition(
  rows: number,
  cols: number,
  entities: Positionable[],
  near: Positionable,
): Position | undefined {
  let nearest: Position | undefined;
  let nearestDistance = Infinity;

  for (let y = 1; y <= rows; y++) {
    for (let x = 1; x <= cols; x++) {
      if (positionOverlapsAnyEntity({ x, y }, entities)) {
        continue;
      }

      const distance = minManhattanDistanceToEntity({ x, y }, near);

      if (
        distance < nearestDistance ||
        (distance === nearestDistance &&
          (!nearest || x < nearest.x || (x === nearest.x && y < nearest.y)))
      ) {
        nearestDistance = distance;
        nearest = { x, y };
      }
    }
  }

  return nearest;
}
