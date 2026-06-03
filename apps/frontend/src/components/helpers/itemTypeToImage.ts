import { BugType } from "../../types/bugType";
import { ItemType } from "../../types/itemType";
import { StructureType } from "../../types/structureType";

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

export function bugTypeToImage(bugType: BugType): string {
  switch (bugType) {
    case "beetle":
      return "/bugs/beetle.webp";
    default:
      throw new Error(`Unknown bug type: ${bugType}`);
  }
}

export function structureTypeToImage(structureType: StructureType): string {
  switch (structureType) {
    case "hole":
      return "/structures/hole.webp";
    case "beetle-house":
      return "/structures/beetle-house.webp";
    default:
      throw new Error(`Unknown structure type: ${structureType}`);
  }
}
