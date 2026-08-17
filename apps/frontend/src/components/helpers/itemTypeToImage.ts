import { BugType, ItemType, StructureType } from "@happy-little-bug-town/utils";

export function itemTypeToImageForItem(itemType: ItemType): string {
  switch (itemType) {
    case "leaf_part":
      return "/items/leaf-part.webp";
    case "little_rock":
      return "/items/little-rock.webp";
    case "root":
      return "/items/root.webp";
    case "stick":
      return "/items/stick.webp";
    case "brick":
      return "/items/brick.webp";
    case "wood":
      return "/items/wood.webp";
    case "axe":
      return "/items/axe.webp";
    case "hammer_and_chisel":
      return "/items/hammer-and-chisel.webp";
    case "leaf_rake":
      return "/items/leaf-rake.webp";
    case "shovel":
      return "/items/shovel.webp";
    case "knife":
      return "/items/knife.webp";
    case "nettle_soup":
      return "/items/nettle-soup.webp";
    case "grilled_roots":
      return "/items/grilled-roots.webp";
    case "iron_ore":
      return "/items/iron-ore.webp";
    case "clay":
      return "/items/clay.webp";
    case "greenfly":
      return "/items/greenfly.webp";
    case "glass":
      return "/items/glass.webp";
    case "paper":
      return "/items/paper.webp";
    case "crucible":
      return "/items/crucible.webp";
    case "iron_ingot":
      return "/items/iron-ingot.webp";
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
    case "root":
      return "/stacks/root-pile.webp";
    case "stick":
      return "/stacks/stick-pile.webp";
    default:
      throw new Error(`Unstackable item type: ${itemType}`);
  }
}

export function bugTypeToImage(bugType: BugType): string {
  switch (bugType) {
    case "beetle":
      return "/bugs/beetle.webp";
    case "ant":
      return "/bugs/ant.webp";
    default:
      throw new Error(`Unknown bug type: ${bugType}`);
  }
}

export function structureTypeToImage(structureType: StructureType): string {
  switch (structureType) {
    case "hole":
      return "/structures/hole.webp";
    case "anthill":
      return "/structures/anthill.webp";
    case "beetle_house":
      return "/structures/beetle-house.webp";
    case "workshop":
      return "/structures/workshop.webp";
    case "stonemason":
      return "/structures/stonemason.webp";
    case "woodcutter":
      return "/structures/woodcutter.webp";
    case "kitchen":
      return "/structures/field-kitchen.webp";
    case "tavern":
      return "/structures/tavern.webp";
    case "smelter":
      return "/structures/smelter.webp";
    default:
      throw new Error(`Unknown structure type: ${structureType}`);
  }
}
