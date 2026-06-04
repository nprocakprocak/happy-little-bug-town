import { ItemType } from "../types/itemType.js";
import { ToolType } from "../types/toolType.js";

export interface ToolCraftResourceCost {
  itemType: ItemType;
  count: number;
}

export const TOOL_CRAFT_COSTS: Record<ToolType, ToolCraftResourceCost[]> = {
  leaf_rake: [
    { itemType: "leaf_part", count: 5 },
    { itemType: "little_rock", count: 10 },
  ],
  shovel: [
    { itemType: "root", count: 5 },
    { itemType: "little_rock", count: 10 },
  ],
};

export function getToolCraftCosts(toolType: ToolType): ToolCraftResourceCost[] {
  return TOOL_CRAFT_COSTS[toolType];
}
