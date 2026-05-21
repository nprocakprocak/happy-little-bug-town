import { Position } from "../types/position.js";
import { Mine, Stack } from "../prisma/prisma/client.js";
import { ItemDto } from "../types/itemDto.js";

export function positionOverlapsMine(position: Position, mine: Mine): boolean {
  return (
    position.x >= mine.x &&
    position.x < mine.x + mine.span &&
    position.y >= mine.y &&
    position.y < mine.y + mine.span
  );
}

function positionOverlapsItem(position: Position, item: ItemDto | Stack): boolean {
  return position.x === item.x && position.y === item.y;
}

export function positionOverlapsAnyMine(position: Position, mines: Mine[]): boolean {
  return mines.some((mine) => positionOverlapsMine(position, mine));
}

export function positionOverlapsAnyItem(position: Position, items: ItemDto[]): boolean {
  return items.some((item) => positionOverlapsItem(position, item));
}

export function positionOverlapsAnyStack(position: Position, stacks: Stack[]): boolean {
  return stacks.some((stack) => positionOverlapsItem(position, stack));
}

export function positionOverlapsAnything(
  position: Position,
  mines: Mine[],
  items: ItemDto[],
  stacks: Stack[],
): boolean {
  return positionOverlapsAnyMine(position, mines) || positionOverlapsAnyItem(position, items) || positionOverlapsAnyStack(position, stacks);
}
