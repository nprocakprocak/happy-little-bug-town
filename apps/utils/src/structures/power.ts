import { BEETLE_MAX_LEAF_PARTS, HOLE_ANT_CAPACITY } from "../constants/game.js";
import {
  STRUCTURE_POWER_REQUIREMENTS,
  StructureBugPowerRequirement,
  StructureItemPowerRequirement,
  StructurePowerRequirement,
} from "../constants/structurePowerRequirements.js";
import { isItemCrafted, ItemForCraft } from "../items/craft.js";
import { BugType } from "../types/bugType.js";
import { ItemType } from "../types/itemType.js";
import { StructureType } from "../types/structureType.js";
import {
  isStructureBuilt,
  isStructureIncomplete,
  StructureForBuild,
} from "./build.js";
import { isStructureUpgradeIncomplete, StructureForUpgrade } from "./upgrade.js";

export interface StructureForPower {
  structureType: StructureType;
  upgradeLevel: number;
  bugs: { bugType: BugType }[];
  items: { itemType: ItemType }[];
}

export interface BugForFedCheck {
  itemIds: string[];
}

export interface BugForStructureDrop {
  bugType: BugType;
  itemIds: string[];
}

export function isBugFed(bug: BugForFedCheck): boolean {
  return bug.itemIds.length >= BEETLE_MAX_LEAF_PARTS;
}

export function pickMostFedBug<T extends BugForFedCheck>(
  bugs: T[],
): T {
  if (bugs.length === 0) {
    throw new Error("Cannot pick most fed bug from empty list");
  }

  return bugs.reduce((mostFed, bug) =>
    bug.itemIds.length > mostFed.itemIds.length ? bug : mostFed,
  );
}

export function structureDropRequiresFedBug(
  structureType: StructureType,
  upgradeLevel: number,
): boolean {
  return structureRequiresPower(structureType, upgradeLevel);
}

export function getHoleAntCount(structure: StructureForPower): number {
  if (structure.structureType !== "hole") {
    return 0;
  }

  return structure.bugs.filter(({ bugType }) => bugType === "ant").length;
}

export function hasHoleAntOccupants(structure: StructureForPower): boolean {
  return getHoleAntCount(structure) > 0;
}

export function getHoleAntOccupancyProgress(
  structure: StructureForPower,
): { count: number; max: number } | null {
  const count = getHoleAntCount(structure);
  if (structure.structureType !== "hole" || count <= 0) {
    return null;
  }

  return { count, max: HOLE_ANT_CAPACITY };
}

export function isHoleReadyToBecomeAnthill(
  structure: StructureForPower,
): boolean {
  return (
    structure.structureType === "hole" &&
    getHoleAntCount(structure) >= HOLE_ANT_CAPACITY
  );
}

export function canStructureAcceptBugDrop(
  bug: Pick<BugForStructureDrop, "bugType">,
  structure: StructureForBuild & StructureForPower,
): boolean {
  if (structure.structureType === "beetle_house") {
    return isStructureBuilt(structure) && bug.bugType === "beetle";
  }

  if (structure.structureType === "hole") {
    return (
      isStructureBuilt(structure) &&
      bug.bugType === "ant" &&
      getHoleAntCount(structure) < HOLE_ANT_CAPACITY
    );
  }

  const bugRequirement = getStructureBugPowerRequirements(
    structure.structureType,
    structure.upgradeLevel,
  ).find((requirement) => requirement.bugType === bug.bugType);
  if (!bugRequirement) {
    return false;
  }

  return (
    isStructureBuilt(structure) &&
    getStructureBugPowerSuppliedCount(structure, bug.bugType) <
      bugRequirement.requiredCount
  );
}

export function canDropBugOnStructure(
  bug: BugForStructureDrop,
  structure: StructureForBuild & StructureForPower,
): boolean {
  if (!canStructureAcceptBugDrop(bug, structure)) {
    return false;
  }

  if (structureDropRequiresFedBug(structure.structureType, structure.upgradeLevel)) {
    return isBugFed(bug);
  }

  return true;
}

export function getStructurePowerRequirement(
  structureType: StructureType,
  upgradeLevel: number,
): StructurePowerRequirement | undefined {
  const requirement = STRUCTURE_POWER_REQUIREMENTS[structureType];
  if (!requirement) {
    return undefined;
  }

  return requirement[upgradeLevel] ?? requirement[0];
}

export function getStructureBugPowerRequirements(
  structureType: StructureType,
  upgradeLevel: number,
): StructureBugPowerRequirement[] {
  return (
    getStructurePowerRequirement(structureType, upgradeLevel)?.bugRequirements ??
    []
  );
}

export function getStructureItemPowerRequirements(
  structureType: StructureType,
  upgradeLevel: number,
): StructureItemPowerRequirement[] {
  return (
    getStructurePowerRequirement(structureType, upgradeLevel)
      ?.itemRequirements ?? []
  );
}

export function structureRequiresPower(
  structureType: StructureType,
  upgradeLevel: number,
): boolean {
  return getStructurePowerRequirement(structureType, upgradeLevel) !== undefined;
}

export function getStructureBugPowerSuppliedCount(
  structure: StructureForPower,
  bugType: BugType,
): number {
  return structure.bugs.filter((bug) => bug.bugType === bugType).length;
}

export function getStructureItemPowerSuppliedCount(
  structure: StructureForPower,
  itemType: ItemType,
): number {
  return structure.items.filter((item) => item.itemType === itemType).length;
}

export function getStructureBugPowerMissing(
  structure: StructureForPower,
  bugType: BugType,
): number {
  const bugRequirement = getStructureBugPowerRequirements(
    structure.structureType,
    structure.upgradeLevel,
  ).find((requirement) => requirement.bugType === bugType);
  if (!bugRequirement) {
    return 0;
  }

  return Math.max(
    0,
    bugRequirement.requiredCount -
      getStructureBugPowerSuppliedCount(structure, bugType),
  );
}

export function getStructureItemPowerMissing(
  structure: StructureForPower,
  itemType: ItemType,
): number {
  const itemRequirement = getStructureItemPowerRequirements(
    structure.structureType,
    structure.upgradeLevel,
  ).find((requirement) => requirement.itemType === itemType);
  if (!itemRequirement) {
    return 0;
  }

  return Math.max(
    0,
    itemRequirement.requiredCount -
      getStructureItemPowerSuppliedCount(structure, itemType),
  );
}

export function hasStructureItemPowerRequirements(
  structureType: StructureType,
  upgradeLevel: number,
): boolean {
  return getStructureItemPowerRequirements(structureType, upgradeLevel).length > 0;
}

export function isStructureBugPowered(structure: StructureForPower): boolean {
  const bugRequirements = getStructureBugPowerRequirements(
    structure.structureType,
    structure.upgradeLevel,
  );
  if (bugRequirements.length === 0) {
    return true;
  }

  return bugRequirements.every(
    ({ bugType, requiredCount }) =>
      getStructureBugPowerSuppliedCount(structure, bugType) >= requiredCount,
  );
}

export function isStructureItemPowered(structure: StructureForPower): boolean {
  const itemRequirements = getStructureItemPowerRequirements(
    structure.structureType,
    structure.upgradeLevel,
  );
  if (itemRequirements.length === 0) {
    return true;
  }

  return itemRequirements.every(
    ({ itemType, requiredCount }) =>
      getStructureItemPowerSuppliedCount(structure, itemType) >= requiredCount,
  );
}

export function isStructurePowered(structure: StructureForPower): boolean {
  return isStructureBugPowered(structure) && isStructureItemPowered(structure);
}

export function canStructureAcceptItemPowerDrop(
  item: ItemForCraft,
  structure: StructureForBuild & StructureForPower,
): boolean {
  const itemRequirement = getStructureItemPowerRequirements(
    structure.structureType,
    structure.upgradeLevel,
  ).find((requirement) => requirement.itemType === item.itemType);
  if (!itemRequirement) {
    return false;
  }

  return (
    isStructureBuilt(structure) &&
    isItemCrafted(item) &&
    getStructureItemPowerSuppliedCount(structure, item.itemType) <
      itemRequirement.requiredCount
  );
}

export function isStructureAwaitingPower(
  structure: StructureForBuild & StructureForPower,
): boolean {
  return (
    structureRequiresPower(structure.structureType, structure.upgradeLevel) &&
    isStructureBuilt(structure) &&
    !isStructurePowered(structure)
  );
}

export function structureShowsActivationGlow(
  structure: StructureForBuild & StructureForPower & StructureForUpgrade,
): boolean {
  return (
    isStructureIncomplete(structure) ||
    isStructureAwaitingPower(structure) ||
    isStructureUpgradeIncomplete(structure)
  );
}
