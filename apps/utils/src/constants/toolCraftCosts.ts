import { ItemType } from "../types/itemType.js";
import { ToolType } from "../types/toolType.js";

export interface ToolCraftResourceCost {
  itemType: ItemType;
  count: number;
}

export const TOOL_CRAFT_COSTS: Partial<
  Record<ToolType, ToolCraftResourceCost[]>
> = {};

export function getToolCraftCosts(toolType: ToolType): ToolCraftResourceCost[] {
  return TOOL_CRAFT_COSTS[toolType] ?? [];
}
