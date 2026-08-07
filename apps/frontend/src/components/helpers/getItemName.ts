import { ItemType } from "@happy-little-bug-town/utils";

export function itemTypeToName(itemType: ItemType): string {
  switch (itemType) {
    case "brick":
      return "Brick";
    default:
      throw new Error(`Unknown item type: ${itemType}`);
  }
}
