import { GridEntity } from "../../../types/gridEntity";
import { isItem } from "../typeGuards";

export function hasRottenAppleOnBoard(entities: GridEntity[]): boolean {
  return entities.some((entity) => isItem(entity) && entity.itemType === "rotten_apple");
}
