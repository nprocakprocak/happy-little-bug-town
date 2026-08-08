import {
  AXE_TOOL_SPAN,
  HAMMER_AND_CHISEL_TOOL_SPAN,
  TOOL_SPAN,
} from "../constants/game.js";
import { ToolType } from "../types/toolType.js";

export function getToolSpan(toolType: ToolType): number {
  if (toolType === "hammer_and_chisel") {
    return HAMMER_AND_CHISEL_TOOL_SPAN;
  }
  if (toolType === "axe") {
    return AXE_TOOL_SPAN;
  }
  return TOOL_SPAN;
}
