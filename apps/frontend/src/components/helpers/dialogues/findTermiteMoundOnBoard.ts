import { GridEntity } from "../../../types/gridEntity";
import { Structure } from "../../../types/structure";
import { isStructure } from "../typeGuards";

export function findTermiteMoundOnBoard(entities: GridEntity[]): Structure | undefined {
  return entities.find(
    (entity): entity is Structure =>
      isStructure(entity) && entity.structureType === "termite_mound",
  );
}
