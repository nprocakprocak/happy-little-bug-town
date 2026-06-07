import { ToolType } from "../types/toolType.js";

export function hasToolType<T extends { toolType: ToolType }>(
  tools: T[],
  toolType: ToolType,
): boolean {
  return tools.some((tool) => tool.toolType === toolType);
}

export function canCreateToolType(tools: { toolType: ToolType }[], toolType: ToolType): boolean {
  if (toolType === "hammer_and_chisel") {
    return true;
  }

  return !hasToolType(tools, toolType);
}
