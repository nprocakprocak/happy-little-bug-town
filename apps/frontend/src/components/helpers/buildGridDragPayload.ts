import { GridEntity } from "../../types/gridEntity";
import type { DragPayload } from "../types/dragPayload";
import { isItem, isStack, isStructure } from "./typeGuards";

export function buildGridDragPayload(
  dx: number,
  dy: number,
  entity: GridEntity,
): DragPayload {
  if (isStructure(entity)) {
    return { dx, dy, target: { kind: "structure", structureId: entity.id }, entity };
  }
  if (isItem(entity)) {
    return { dx, dy, target: { kind: "item", itemId: entity.id }, entity };
  }
  if (isStack(entity)) {
    return { dx, dy, target: { kind: "stack", stackId: entity.id }, entity };
  }
  return { dx, dy, target: { kind: "bug", bugId: entity.id }, entity };
}
