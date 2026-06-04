import { ToolType } from "@happy-little-park/utils";

export function toolTypeToName(toolType: ToolType): string {
  switch (toolType) {
    case "leaf_rake":
      return "Leaf rake";
    default:
      throw new Error(`Unknown tool type: ${toolType}`);
  }
}
