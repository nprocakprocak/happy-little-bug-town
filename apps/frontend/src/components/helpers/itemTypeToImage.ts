import { ItemType } from "@happy-little-park/types";

export function itemTypeToImage(itemType: ItemType): string {
  switch (itemType) {
    case "leaf_part":
      return "/items/leaf-part.webp";
    case "little_rock":
      return "/items/little-rock.webp";
    case "stick":
      return "/items/stick.webp";
    default:
      throw new Error(`Unknown item type: ${itemType}`);
  }
}
