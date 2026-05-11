import { ItemType } from "@happy-little-park/types";

export function itemTypeToImage(itemType: ItemType): string {
  switch (itemType) {
    case "leaf-part":
      return "/items/leaf-part.webp";
    case "little-rock":
      return "/items/little-rock.webp";
    default:
      throw new Error(`Unknown item type: ${itemType}`);
  }
}
