import { BugType } from "../types/bugType.js";
import { StructureType } from "../types/structureType.js";
import { ToolType } from "../types/toolType.js";

export interface StructureToolPowerRequirement {
  toolType: ToolType;
  requiredCount: number;
}

export interface StructurePowerRequirement {
  requiredCount: number;
  occupantBugType: BugType;
  toolRequirements?: StructureToolPowerRequirement[];
}

export const STRUCTURE_POWER_REQUIREMENTS: Partial<
  Record<StructureType, StructurePowerRequirement>
> = {
  workshop: { requiredCount: 10, occupantBugType: "beetle" },
  stonemason: {
    requiredCount: 10,
    occupantBugType: "beetle",
    toolRequirements: [{ toolType: "hammer_and_chisel", requiredCount: 3 }],
  },
};
