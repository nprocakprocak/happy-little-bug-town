import { GridEntity } from "../../types/gridEntity";
import { isStructure } from "./typeGuards";

export function isStartingBoardState(
  entities: GridEntity[],
): boolean {
  return (
    entities.length === 1 &&
    isStructure(entities[0]) &&
    entities[0].structureType === "hole"
  );
}
