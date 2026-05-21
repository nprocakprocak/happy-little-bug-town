import { Item } from "../../types/item";
import { Position } from "../../types/position";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";

export function positionOverlapsStructure(position: Position, structure: Structure): boolean {
  return (
    position.x >= structure.x &&
    position.x < structure.x + structure.span &&
    position.y >= structure.y &&
    position.y < structure.y + structure.span
  );
}

function positionOverlapsItemOrStack(position: Position, itemOrStack: Position): boolean {
  return position.x === itemOrStack.x && position.y === itemOrStack.y;
}

export function positionOverlapsAnyStructure(position: Position, structures: Structure[]): boolean {
  return structures.some((structure) => positionOverlapsStructure(position, structure));
}

export function positionOverlapsAnyItem(position: Position, itemsOrStacks: Position[]): boolean {
  return itemsOrStacks.some((item) => positionOverlapsItemOrStack(position, item));
}

export function positionOverlapsAnything(
  position: Position,
  structures: Structure[],
  itemsOrStacks: Position[],
): boolean {
  return (
    positionOverlapsAnyStructure(position, structures) ||
    positionOverlapsAnyItem(position, itemsOrStacks)
  );
}

export function findOverlappingItem(position: Position, items: Item[]): Item | undefined {
  return items.find((item) => positionOverlapsItemOrStack(position, item));
}

export function findOverlappingStack(position: Position, stacks: Stack[]): Stack | undefined {
  return stacks.find((stack) => positionOverlapsItemOrStack(position, stack));
}
