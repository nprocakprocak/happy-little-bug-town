import { Position } from "@happy-little-park/utils";

export function isPositioned(entity: { x: number | null; y: number | null }): entity is Position {
  return entity.x !== null && entity.y !== null;
}
