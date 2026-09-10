import { GridEntity } from "../../../types/gridEntity";
import { isBug } from "../typeGuards";

export function hasGreenflyOnBoard(entities: GridEntity[]): boolean {
  return entities.some((entity) => isBug(entity) && entity.bugType === "greenfly");
}
