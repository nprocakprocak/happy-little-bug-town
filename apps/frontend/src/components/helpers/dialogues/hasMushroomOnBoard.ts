import { GridEntity } from "../../../types/gridEntity";
import { isItem } from "../typeGuards";

export function hasMushroomOnBoard(entities: GridEntity[]): boolean {
  return entities.some((entity) => isItem(entity) && entity.itemType === "mushroom");
}
