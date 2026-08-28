import { StructureType } from "../types/structureType.js";
import { isGroundEvolutionStructureType } from "./evolution.js";

export function canRelocateStructureType(structureType: StructureType): boolean {
  return !isGroundEvolutionStructureType(structureType);
}
