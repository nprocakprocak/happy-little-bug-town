import { getToolCraftCosts } from "../constants/toolCraftCosts.js";
import { ItemType } from "../types/itemType.js";
import { ToolType } from "../types/toolType.js";
import { getToolSpan } from "./span.js";

export interface ToolCraftItem {
  itemType: ItemType;
}

export interface ToolForCraft {
  toolType: ToolType;
  items: ToolCraftItem[];
}

export interface ToolCraftResourceProgress {
  itemType: ItemType;
  supplied: number;
  required: number;
  missing: number;
}

export function isToolCrafted(tool: ToolForCraft): boolean {
  const costs = getToolCraftCosts(tool.toolType);

  return costs.every(({ itemType, count }) => {
    const supplied = tool.items.filter((item) => item.itemType === itemType).length;
    return supplied >= count;
  });
}

export function isToolIncomplete(tool: ToolForCraft): boolean {
  return !isToolCrafted(tool);
}

export function getToolCraftProgress(tool: ToolForCraft): ToolCraftResourceProgress[] {
  const costs = getToolCraftCosts(tool.toolType);

  return costs.map(({ itemType, count: required }) => {
    const supplied = tool.items.filter((item) => item.itemType === itemType).length;
    const missing = Math.max(0, required - supplied);
    return { itemType, supplied, required, missing };
  });
}

export function getActiveToolCraftResource(
  tool: ToolForCraft,
): ToolCraftResourceProgress | undefined {
  return getToolCraftProgress(tool).find(({ missing }) => missing > 0);
}

export function getVisibleToolCraftProgress(tool: ToolForCraft): ToolCraftResourceProgress[] {
  const progress = getToolCraftProgress(tool);

  if (getToolSpan(tool.toolType) === 1) {
    const activeResource = getActiveToolCraftResource(tool);
    return activeResource ? [activeResource] : [];
  }

  return progress;
}

export function canAcceptItemForToolCraft(tool: ToolForCraft, itemType: ItemType): boolean {
  if (!isToolIncomplete(tool)) {
    return false;
  }

  if (getToolSpan(tool.toolType) === 1) {
    const activeResource = getActiveToolCraftResource(tool);
    return activeResource !== undefined && activeResource.itemType === itemType;
  }

  const resourceProgress = getToolCraftProgress(tool).find(
    (progress) => progress.itemType === itemType,
  );

  return resourceProgress !== undefined && resourceProgress.missing > 0;
}

export function canDropItemOnTool(
  item: { itemType: ItemType },
  tool: ToolForCraft,
): boolean {
  return canAcceptItemForToolCraft(tool, item.itemType);
}

export function toolShowsActivationGlow(tool: ToolForCraft): boolean {
  return isToolIncomplete(tool);
}
