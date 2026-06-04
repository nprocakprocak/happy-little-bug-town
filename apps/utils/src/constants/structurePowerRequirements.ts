import { BugType } from "../types/bugType.js";
import { StructureType } from "../types/structureType.js";

export interface StructurePowerRequirement {
  requiredCount: number;
  occupantBugType: BugType;
}

export const STRUCTURE_POWER_REQUIREMENTS: Partial<
  Record<StructureType, StructurePowerRequirement>
> = {
  workshop: { requiredCount: 10, occupantBugType: "beetle" },
};
