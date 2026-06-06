import { StructureType } from "../types/structureType.js";

export function hasStructureType<T extends { structureType: StructureType }>(
  structures: T[],
  structureType: StructureType,
): boolean {
  return structures.some((structure) => structure.structureType === structureType);
}
