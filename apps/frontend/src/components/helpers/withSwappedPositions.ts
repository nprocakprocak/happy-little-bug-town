import { Position } from "@happy-little-bug-town/utils";

export function withSwappedPositions<T extends { id: string; x: number; y: number }>(
  entities: T[],
  sourceId: string,
  targetId: string,
  sourcePosition: Position,
  targetPosition: Position,
): T[] {
  return entities.map((entity) => {
    if (entity.id === sourceId) {
      return {
        ...entity,
        x: targetPosition.x,
        y: targetPosition.y,
        fromX: undefined,
        fromY: undefined,
      };
    }
    if (entity.id === targetId) {
      return {
        ...entity,
        x: sourcePosition.x,
        y: sourcePosition.y,
        fromX: targetPosition.x,
        fromY: targetPosition.y,
      };
    }
    return entity;
  });
}
