import { ToolType } from "@happy-little-park/utils";

export function toolTypeToImage(toolType: ToolType): string {
  switch (toolType) {
    case "leaf_rake":
      return "/tools/leaf-rake.webp";
    case "shovel":
      return "/tools/shovel.webp";
    case "hammer_and_chisel":
      return "/tools/hammer-and-chisel.webp";
    case "brick":
      return "/tools/brick.webp";
    case "axe":
      return "/items/axe.webp";
    default:
      throw new Error(`Unknown tool type: ${toolType}`);
  }
}
