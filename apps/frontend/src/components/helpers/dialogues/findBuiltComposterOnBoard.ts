import { isStructureBuilt } from "@happy-little-bug-town/utils";

import { GridEntity } from "../../../types/gridEntity";
import { Structure } from "../../../types/structure";
import { isStructure } from "../typeGuards";

export function findBuiltComposterOnBoard(entities: GridEntity[]): Structure | undefined {
  return entities.find(
    (entity): entity is Structure =>
      isStructure(entity) && entity.structureType === "composter" && isStructureBuilt(entity),
  );
}
