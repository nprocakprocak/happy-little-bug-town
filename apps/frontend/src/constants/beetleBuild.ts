import { BuildableStructureType } from "@happy-little-bug-town/utils";

import { Structure } from "../types/structure";

const BUILDABLE_STRUCTURE_TYPES: BuildableStructureType[] = [
  "beetle_house",
  "workshop",
  "stonemason",
  "woodcutter",
  "kitchen",
  "tavern",
];

export const BUILDING_OPTIONS: Structure[] = BUILDABLE_STRUCTURE_TYPES.map<Structure>(
  (structureType) => ({
    id: `build-option-${structureType}`,
    x: 0,
    y: 0,
    structureType,
    items: [],
    bugs: [],
  }),
);
