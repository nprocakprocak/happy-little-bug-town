import { WorkshopItemType } from "@happy-little-bug-town/utils";

export function itemTypeToDescription(itemType: WorkshopItemType): string | undefined {
  switch (itemType) {
    case "axe":
      return "Required to build woodcutter";
    case "hammer_and_chisel":
      return "Used in stonemason station";
    case "leaf_rake":
      return "Allows you to group light items like leaves into stacks";
    case "knife":
      return "Required in kitchen";
    case "hammer":
      return "Allows to relocate and demolish structures";
    case "crucible":
      return "Needed in smelter";
    case "hoe":
      return "Required by farm";
    case "wheelbarrel":
      return "Makes it possible to stack heavy items like rocks";
    case "desk":
      return "Used in library";
    case "basket":
      return "Allows to stack organic items like paper and apples";
    case "fountain":
      return "Required to build town hall";
    default:
      return undefined;
  }
}
