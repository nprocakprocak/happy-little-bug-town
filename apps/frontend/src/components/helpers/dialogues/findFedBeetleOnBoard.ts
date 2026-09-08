import { isBugFed } from "@happy-little-bug-town/utils";

import { Bug } from "../../../types/bug";
import { GridEntity } from "../../../types/gridEntity";
import { isBug } from "../typeGuards";

export function findFedBeetleOnBoard(entities: GridEntity[]): Bug | undefined {
  return entities.find(
    (entity): entity is Bug => isBug(entity) && entity.bugType === "beetle" && isBugFed(entity),
  );
}
