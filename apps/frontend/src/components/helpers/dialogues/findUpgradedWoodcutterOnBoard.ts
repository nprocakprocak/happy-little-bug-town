import {
  getCompletedUpgradeLevel,
  isStructureBuilt,
  isStructurePowered,
} from "@happy-little-bug-town/utils";

import { GridEntity } from "../../../types/gridEntity";
import { Structure } from "../../../types/structure";
import { isStructure } from "../typeGuards";

export function findUpgradedWoodcutterOnBoard(entities: GridEntity[]): Structure | undefined {
  return entities.find(
    (entity): entity is Structure =>
      isStructure(entity) &&
      entity.structureType === "woodcutter" &&
      isStructureBuilt(entity) &&
      getCompletedUpgradeLevel(entity) >= 1 &&
      isStructurePowered(entity),
  );
}
