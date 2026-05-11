import type { GridDragPayload } from "../../types/gridDrag";
import type { Item } from "../../types/item";
import type { Mine } from "../../types/mine";

export function buildGridDragPayload(
  index: number,
  dx: number,
  dy: number,
  cols: number,
  mines: Mine[],
  items: Item[],
): GridDragPayload | null {
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
  return null;
}
