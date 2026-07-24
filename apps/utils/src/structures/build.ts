import {
  BUILD_RESOURCE_COSTS,
  BUILD_TOOL_COSTS,
  BuildResourceCost,
  BuildToolCost,
} from "../constants/structureBuildCosts.js";
import { ItemType } from "../types/itemType.js";
import {
  BuildableStructureType,
  StructureType,
} from "../types/structureType.js";
import { ToolType } from "../types/toolType.js";
import { isBuildableStructureType } from "../typeGuards/buildable.js";
import { isToolCrafted, ToolForCraft } from "../tools/craft.js";

export interface StructureBuildItem {
  itemType: ItemType;
}

export interface StructureBuildTool {
  toolType: ToolType;
}

export interface StructureForBuild {
  structureType: StructureType;
  items: StructureBuildItem[];
  tools?: StructureBuildTool[];
}

export interface StructureWithIdentifiableItems {
  structureType: StructureType;
  items: { id: string; itemType: ItemType }[];
}

export interface StructureBuildResourceProgress {
  itemType: ItemType;
  supplied: number;
  required: number;
  missing: number;
}

export interface StructureBuildToolProgress {
  toolType: ToolType;
  supplied: number;
  required: number;
  missing: number;
}

export function getBuildResourceCosts(
  structureType: StructureType,
): BuildResourceCost[] | undefined {
  if (isBuildableStructureType(structureType)) {
    return BUILD_RESOURCE_COSTS[structureType];
  }
  return undefined;
}

export function getBuildToolCosts(
  structureType: StructureType,
): BuildToolCost[] | undefined {
  if (isBuildableStructureType(structureType)) {
    return BUILD_TOOL_COSTS[structureType];
  }
  return undefined;
}

export function getBuildResourceCostsForType(
  structureType: BuildableStructureType,
): BuildResourceCost[] {
  return BUILD_RESOURCE_COSTS[structureType];
}

export function getBuildToolCostsForType(
  structureType: BuildableStructureType,
): BuildToolCost[] {
  return BUILD_TOOL_COSTS[structureType] ?? [];
}

function areBuildItemsSupplied(structure: StructureForBuild, costs: BuildResourceCost[]): boolean {
  return costs.every(({ itemType, count }) => {
    const supplied = structure.items.filter((item) => item.itemType === itemType).length;
    return supplied >= count;
  });
}

function areBuildToolsSupplied(structure: StructureForBuild, costs: BuildToolCost[]): boolean {
  return costs.every(({ toolType, count }) => {
    const supplied = (structure.tools ?? []).filter((tool) => tool.toolType === toolType).length;
    return supplied >= count;
  });
}

export function isStructureBuilt(structure: StructureForBuild): boolean {
  if (structure.structureType === "hole") {
    return true;
  }

  const itemCosts = getBuildResourceCosts(structure.structureType);
  if (!itemCosts) {
    return false;
  }

  const toolCosts = getBuildToolCosts(structure.structureType) ?? [];

  return areBuildItemsSupplied(structure, itemCosts) && areBuildToolsSupplied(structure, toolCosts);
}

export function isStructureIncomplete(structure: StructureForBuild): boolean {
  return !isStructureBuilt(structure);
}

export function getStructureBuildProgress(
  structure: StructureForBuild,
): StructureBuildResourceProgress[] {
  const costs = getBuildResourceCosts(structure.structureType);
  if (!costs) {
    return [];
  }

  return costs.map(({ itemType, count: required }) => {
    const supplied = structure.items.filter((item) => item.itemType === itemType).length;
    const missing = Math.max(0, required - supplied);
    return { itemType, supplied, required, missing };
  });
}

export function getStructureBuildToolProgress(
  structure: StructureForBuild,
): StructureBuildToolProgress[] {
  const costs = getBuildToolCosts(structure.structureType);
  if (!costs) {
    return [];
  }

  return costs.map(({ toolType, count: required }) => {
    const supplied = (structure.tools ?? []).filter((tool) => tool.toolType === toolType).length;
    const missing = Math.max(0, required - supplied);
    return { toolType, supplied, required, missing };
  });
}

export function canAcceptItemForBuild(
  structure: StructureForBuild,
  itemType: ItemType,
): boolean {
  if (!isStructureIncomplete(structure)) {
    return false;
  }

  const resourceProgress = getStructureBuildProgress(structure).find(
    (progress) => progress.itemType === itemType,
  );

  return resourceProgress !== undefined && resourceProgress.missing > 0;
}

export function canAcceptToolForBuild(
  structure: StructureForBuild,
  tool: ToolForCraft,
): boolean {
  if (!isStructureIncomplete(structure)) {
    return false;
  }

  const toolProgress = getStructureBuildToolProgress(structure).find(
    (progress) => progress.toolType === tool.toolType,
  );

  return (
    toolProgress !== undefined && toolProgress.missing > 0 && isToolCrafted(tool)
  );
}
