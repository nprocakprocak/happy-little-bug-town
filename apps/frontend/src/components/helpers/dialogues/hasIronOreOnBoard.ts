import { GridEntity } from "../../../types/gridEntity";
import { isItem } from "../typeGuards";

export function hasIronOreOnBoard(entities: GridEntity[]): boolean {
  return entities.some((entity) => isItem(entity) && entity.itemType === "iron_ore");
}
