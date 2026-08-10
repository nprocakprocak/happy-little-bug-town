import { ToolType } from "@happy-little-bug-town/utils";

export function toolTypeToName(toolType: ToolType): string {
  switch (toolType) {
    case "shovel":
      return "Shovel";
    default:
      throw new Error(`Unknown tool type: ${toolType}`);
  }
}
