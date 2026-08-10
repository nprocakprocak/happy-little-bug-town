import { ToolType } from "@happy-little-bug-town/utils";

export function toolTypeToName(toolType: ToolType): string {
  throw new Error(`Unknown tool type: ${toolType}`);
}
