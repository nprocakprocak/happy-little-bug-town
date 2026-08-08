import { TOOL_SPAN } from "../constants/game.js";
import { ToolType } from "../types/toolType.js";

export function getToolSpan(toolType: ToolType): number {
  void toolType;
  return TOOL_SPAN;
}
