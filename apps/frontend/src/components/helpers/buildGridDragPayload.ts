import type { DragPayload } from "../../domain/drag-n-drop/dragPayload";
import type { Item } from "../../types/item";
import type { Stack } from "../../types/stack";
import type { Structure } from "../../types/structure";

export function buildGridDragPayload(
  index: number,
  dx: number,
  dy: number,
  cols: number,
  structures: Structure[],
  items: Item[],
  stacks: Stack[],
): DragPayload | null {
  const gridRow = Math.floor(index / cols) + 1;
  const gridCol = (index % cols) + 1;
  const structure = structures.find((s) => s.x === gridCol && s.y === gridRow);
  if (structure) {
    return { dx, dy, target: { kind: "structure", structureId: structure.id } };
  }
  const item = items.find((i) => i.x === gridCol && i.y === gridRow);
  if (item) {
    return { dx, dy, target: { kind: "item", itemId: item.id } };
  }
  const stack = stacks.find((s) => s.x === gridCol && s.y === gridRow);
  if (stack) {
    return { dx, dy, target: { kind: "stack", stackId: stack.id } };
  }
  return null;
}
