import { GridEntity } from "../../../types/gridEntity";
import { isItem, isStack } from "../typeGuards";

export function hasClayOnBoard(entities: GridEntity[]): boolean {
  return entities.some(
    (entity) => isItem(entity) && entity.itemType === "clay",
  );
}
