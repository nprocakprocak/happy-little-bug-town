import { Position } from "@happy-little-bug-town/utils";

export function isPositioned(entity: { x: number | null; y: number | null }): entity is Position {
  return entity.x !== null && entity.y !== null;
}
