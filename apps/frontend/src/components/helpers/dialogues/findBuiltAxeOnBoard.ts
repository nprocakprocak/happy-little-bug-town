import { isItemCrafted } from "@happy-little-bug-town/utils";

import { GridEntity } from "../../../types/gridEntity";
import { Item } from "../../../types/item";
import { isItem } from "../typeGuards";

export function findBuiltAxeOnBoard(entities: GridEntity[]): Item | undefined {
  return entities.find(
    (entity): entity is Item =>
      isItem(entity) && entity.itemType === "axe" && isItemCrafted(entity),
  );
}
