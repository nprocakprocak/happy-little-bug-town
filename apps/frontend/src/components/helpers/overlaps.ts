import { Item } from "../../types/item";
import { Mine } from "../../types/mine";
import { Position } from "../../types/position";

export function positionOverlapsMine(position: Position, mine: Mine): boolean {
  return (
    position.x >= mine.x &&
    position.x < mine.x + mine.span &&
    position.y >= mine.y &&
    position.y < mine.y + mine.span
  );
}

function positionOverlapsItem(position: Position, item: Item): boolean {
  return position.x === item.x && position.y === item.y;
}

export function positionOverlapsAnyMine(position: Position, mines: Mine[]): boolean {
  return mines.some((mine) => positionOverlapsMine(position, mine));
}

export function positionOverlapsAnyItem(position: Position, items: Item[]): boolean {
  return items.some((item) => positionOverlapsItem(position, item));
}

export function positionOverlapsAnything(
  position: Position,
  mines: Mine[],
  items: Item[],
): boolean {
  return positionOverlapsAnyMine(position, mines) || positionOverlapsAnyItem(position, items);
}
