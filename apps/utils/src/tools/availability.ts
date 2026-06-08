import { ToolType } from "../types/toolType.js";

const MULTI_CREATE_TOOL_TYPES = new Set<ToolType>(["hammer_and_chisel", "axe"]);

export function canCreateMultipleOfToolType(toolType: ToolType): boolean {
  return MULTI_CREATE_TOOL_TYPES.has(toolType);
}

export function hasToolType<T extends { toolType: ToolType }>(
  tools: T[],
  toolType: ToolType,
): boolean {
  return tools.some((tool) => tool.toolType === toolType);
}

export function canCreateToolType(tools: { toolType: ToolType }[], toolType: ToolType): boolean {
  if (canCreateMultipleOfToolType(toolType)) {
    return true;
  }

  return !hasToolType(tools, toolType);
}
