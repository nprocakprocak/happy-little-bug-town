import type { DragPayload } from "../../domain/drag-n-drop/dragPayload";
import type { Item } from "../../types/item";
import type { Mine } from "../../types/mine";
import type { Stack } from "../../types/stack";

export function buildGridDragPayload(
  index: number,
  dx: number,
  dy: number,
  cols: number,
  mines: Mine[],
  items: Item[],
  stacks: Stack[],
): DragPayload | null {
  const gridRow = Math.floor(index / cols) + 1;
  const gridCol = (index % cols) + 1;
  const mine = mines.find((m) => m.x === gridCol && m.y === gridRow);
  if (mine) {
    return { dx, dy, target: { kind: "mine", mineId: mine.id } };
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
