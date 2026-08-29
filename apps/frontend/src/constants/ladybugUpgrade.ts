import {
  getStructureUpgradeLevels,
  UPGRADABLE_STRUCTURE_TYPES,
} from "@happy-little-bug-town/utils";

const UPGRADE_LEVELS = Array.from(
  new Set(UPGRADABLE_STRUCTURE_TYPES.flatMap(getStructureUpgradeLevels)),
).sort((left, right) => left - right);

export const UPGRADE_OPTIONS = UPGRADE_LEVELS.flatMap((upgradeLevel) =>
  UPGRADABLE_STRUCTURE_TYPES.filter((structureType) =>
    getStructureUpgradeLevels(structureType).includes(upgradeLevel),
  ).map((structureType) => ({
    id: `upgrade-option-${structureType}-${upgradeLevel}`,
    structureType,
    upgradeLevel,
  })),
);
