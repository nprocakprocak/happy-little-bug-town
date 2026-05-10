import { Item } from "../../types/item";
import { Mine } from "../../types/mine";
import { SelectedSquarePosition } from "../../types/position";

function positionOverlapsMine(position: SelectedSquarePosition, mine: Mine): boolean {
  return (
    position.x >= mine.x &&
    position.x < mine.x + mine.span &&
    position.y >= mine.y &&
    position.y < mine.y + mine.span
  );
}

function positionOverlapsItem(position: SelectedSquarePosition, item: Item): boolean {
  return position.x === item.x && position.y === item.y;
}

export function positionOverlapsAnyMine(position: SelectedSquarePosition, mines: Mine[]): boolean {
  return mines.some((mine) => positionOverlapsMine(position, mine));
}

export function positionOverlapsAnyItem(position: SelectedSquarePosition, items: Item[]): boolean {
  return items.some((item) => positionOverlapsItem(position, item));
}

export function positionOverlapsAnything(position: SelectedSquarePosition, mines: Mine[], items: Item[]): boolean {
  return positionOverlapsAnyMine(position, mines) || positionOverlapsAnyItem(position, items);
}
