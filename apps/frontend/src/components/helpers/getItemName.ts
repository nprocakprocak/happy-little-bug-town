import { ItemType } from "@happy-little-bug-town/utils";

export function itemTypeToName(itemType: ItemType): string {
  switch (itemType) {
    case "axe":
      return "Axe";
    case "hammer_and_chisel":
      return "Hammer and chisel";
    case "leaf_rake":
      return "Leaf rake";
    default:
      throw new Error(`Unknown item type: ${itemType}`);
  }
}
