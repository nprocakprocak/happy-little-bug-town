import { ToolType } from "../types/toolType.js";

export function canCreateMultipleOfToolType(toolType: ToolType): boolean {
  void toolType;
  return false;
}

export function hasToolType<T extends { toolType: ToolType }>(
  tools: T[],
  toolType: ToolType,
): boolean {
  return tools.some((tool) => tool.toolType === toolType);
}

export function canCreateToolType(
  tools: { toolType: ToolType }[],
  toolType: ToolType,
): boolean {
  return !hasToolType(tools, toolType);
}
