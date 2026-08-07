import type { Bug } from "../../types/bug";
import type { DragPayload } from "../../types/dragPayload";
import type { Item } from "../../types/item";
import type { Stack } from "../../types/stack";
import type { Structure } from "../../types/structure";
import type { Tool } from "../../types/tool";

export function buildGridDragPayload(
  index: number,
  dx: number,
  dy: number,
  cols: number,
  structures: Structure[],
  tools: Tool[],
  items: Item[],
  stacks: Stack[],
  bugs: Bug[],
): DragPayload | null {
  const gridRow = Math.floor(index / cols) + 1;
  const gridCol = (index % cols) + 1;
  const structure = structures.find((s) => s.x === gridCol && s.y === gridRow);
  if (structure) {
    return { dx, dy, target: { kind: "structure", structureId: structure.id } };
  }
  const tool = tools.find((t) => t.x === gridCol && t.y === gridRow);
  if (tool) {
    return { dx, dy, target: { kind: "tool", toolId: tool.id } };
  }
  const item = items.find((i) => i.x === gridCol && i.y === gridRow);
  if (item) {
    return { dx, dy, target: { kind: "item", itemId: item.id } };
  }
  const stack = stacks.find((s) => s.x === gridCol && s.y === gridRow);
  if (stack) {
    return { dx, dy, target: { kind: "stack", stackId: stack.id } };
  }
  const bug = bugs.find((b) => b.x === gridCol && b.y === gridRow);
  if (bug) {
    return { dx, dy, target: { kind: "bug", bugId: bug.id } };
  }
  return null;
}
