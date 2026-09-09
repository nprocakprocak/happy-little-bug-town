import { GridEntity } from "../../../types/gridEntity";
import { Item } from "../../../types/item";
import { isItem } from "../typeGuards";

export function findWoodOnBoard(entities: GridEntity[]): Item | undefined {
  return entities.find((entity): entity is Item => isItem(entity) && entity.itemType === "wood");
}
