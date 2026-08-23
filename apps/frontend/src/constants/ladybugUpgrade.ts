import { UpgradableStructureType } from "@happy-little-bug-town/utils";

const UPGRADABLE_STRUCTURE_TYPES: UpgradableStructureType[] = [
  "stonemason",
  "woodcutter",
  "kitchen",
];

export const UPGRADE_OPTIONS = UPGRADABLE_STRUCTURE_TYPES.map((structureType) => ({
  id: `upgrade-option-${structureType}`,
  structureType,
}));
