import { BuildableStructureType } from "@happy-little-park/utils";

import { Structure } from "../types/structure";

const BUILDABLE_STRUCTURE_TYPES: BuildableStructureType[] = [
  "beetle_house",
  "workshop",
  "stonemason",
];

export const BUILDING_OPTIONS: Structure[] = BUILDABLE_STRUCTURE_TYPES.map<Structure>(
  (structureType) => ({
    id: `build-option-${structureType}`,
    x: 0,
    y: 0,
    span: 1,
    structureType,
    items: [],
    bugs: [],
  }),
);
