import { FarmBuildableStructureType } from "@happy-little-bug-town/utils";

import { Structure } from "../types/structure";

const FARM_BUILDABLE_STRUCTURE_TYPES: FarmBuildableStructureType[] = [
  "mushrooms_field",
  "composter",
  "flowers_field",
];

export const FARM_BUILDING_OPTIONS: Structure[] = FARM_BUILDABLE_STRUCTURE_TYPES.map<Structure>(
  (structureType) => ({
    id: `farm-build-option-${structureType}`,
    x: 0,
    y: 0,
    structureType,
    upgradeLevel: 0,
    items: [],
    bugs: [],
  }),
);
