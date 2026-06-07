import { HAMMER_AND_CHISEL_TOOL_SPAN, TOOL_SPAN } from "../constants/game.js";
import { ToolType } from "../types/toolType.js";

export function getToolSpan(toolType: ToolType): number {
  return toolType === "hammer_and_chisel" ? HAMMER_AND_CHISEL_TOOL_SPAN : TOOL_SPAN;
}
