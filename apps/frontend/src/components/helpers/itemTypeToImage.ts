import { ItemType } from "@happy-little-park/types";

export function itemTypeToImageForItem(itemType: ItemType): string {
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

export function itemTypeToImageForStack(itemType: ItemType): string {
  switch (itemType) {
    case "leaf_part":
      return "/stacks/leaf-parts.webp";
    case "little_rock":
      return "/stacks/little-rocks.webp";
    case "stick":
      return "/items/stick.webp";
    default:
      throw new Error(`Unknown item type: ${itemType}`);
  }
}
