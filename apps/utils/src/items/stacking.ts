import { ItemType } from "../types/itemType.js";
import { ToolType } from "../types/toolType.js";
import { isToolCrafted, ToolForCraft } from "../tools/craft.js";

const LEAF_RAKE_TOOL_TYPE: ToolType = "leaf_rake";

export function hasCraftedTool(tools: ToolForCraft[], toolType: ToolType): boolean {
  const tool = tools.find((candidate) => candidate.toolType === toolType);
  return tool !== undefined && isToolCrafted(tool);
}

export function canStackItemType(itemType: ItemType, tools: ToolForCraft[]): boolean {
  if (itemType === "leaf_part") {
    return hasCraftedTool(tools, LEAF_RAKE_TOOL_TYPE);
  }

  return true;
}
