import { ToolType } from "@happy-little-bug-town/utils";

export function toolTypeToName(toolType: ToolType): string {
  switch (toolType) {
    case "leaf_rake":
      return "Leaf rake";
    case "shovel":
      return "Shovel";
    case "hammer_and_chisel":
      return "Hammer and chisel";
    case "axe":
      return "Axe";
    default:
      throw new Error(`Unknown tool type: ${toolType}`);
  }
}
