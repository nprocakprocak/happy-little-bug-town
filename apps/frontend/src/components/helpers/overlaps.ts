import { Item, Mine, Position, Stack } from "@happy-little-park/types";

export function positionOverlapsMine(position: Position, mine: Mine): boolean {
  return (
    position.x >= mine.x &&
    position.x < mine.x + mine.span &&
    position.y >= mine.y &&
    position.y < mine.y + mine.span
  );
}

function positionOverlapsItemOrStack(position: Position, itemOrStack: Position): boolean {
  return position.x === itemOrStack.x && position.y === itemOrStack.y;
}

export function positionOverlapsAnyMine(position: Position, mines: Mine[]): boolean {
  return mines.some((mine) => positionOverlapsMine(position, mine));
}

export function positionOverlapsAnyItem(position: Position, itemsOrStacks: Position[]): boolean {
  return itemsOrStacks.some((item) => positionOverlapsItemOrStack(position, item));
}

export function positionOverlapsAnything(
  position: Position,
  mines: Mine[],
  itemsOrStacks: Position[],
): boolean {
  return (
    positionOverlapsAnyMine(position, mines) || positionOverlapsAnyItem(position, itemsOrStacks)
  );
}

export function findOverlappingItem(position: Position, items: Item[]): Item | undefined {
  return items.find((item) => positionOverlapsItemOrStack(position, item));
}

export function findOverlappingStack(position: Position, stacks: Stack[]): Stack | undefined {
  return stacks.find((stack) => positionOverlapsItemOrStack(position, stack));
}
