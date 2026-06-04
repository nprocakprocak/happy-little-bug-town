import { ToolType } from "@happy-little-park/utils";

export function toolTypeToImage(toolType: ToolType): string {
  switch (toolType) {
    case "leaf_rake":
      return "/items/leaf-rake.webp";
    default:
      throw new Error(`Unknown tool type: ${toolType}`);
  }
}
