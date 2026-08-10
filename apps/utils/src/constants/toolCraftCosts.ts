import { ItemType } from "../types/itemType.js";
import { ToolType } from "../types/toolType.js";

export interface ToolCraftResourceCost {
  itemType: ItemType;
  count: number;
}

export const TOOL_CRAFT_COSTS: Record<ToolType, ToolCraftResourceCost[]> = {
  shovel: [
    { itemType: "leaf_part", count: 5 },
    { itemType: "little_rock", count: 10 },
    { itemType: "stick", count: 10 },
    { itemType: "root", count: 5 },
  ],
};

export function getToolCraftCosts(toolType: ToolType): ToolCraftResourceCost[] {
  return TOOL_CRAFT_COSTS[toolType];
}
