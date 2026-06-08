import { AXE_TOOL_SPAN, BRICK_TOOL_SPAN, HAMMER_AND_CHISEL_TOOL_SPAN, TOOL_SPAN, WOOD_TOOL_SPAN } from "../constants/game.js";
import { ToolType } from "../types/toolType.js";

export function getToolSpan(toolType: ToolType): number {
  if (toolType === "hammer_and_chisel") {
    return HAMMER_AND_CHISEL_TOOL_SPAN;
  }
  if (toolType === "brick") {
    return BRICK_TOOL_SPAN;
  }
  if (toolType === "axe") {
    return AXE_TOOL_SPAN;
  }
  if (toolType === "wood") {
    return WOOD_TOOL_SPAN;
  }
  return TOOL_SPAN;
}
