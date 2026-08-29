import { ItemType } from "@happy-little-bug-town/utils";

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
    case "hammer":
      return "/items/hammer.webp";
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
    case "grilled_greenflies":
      return "/items/grilled-greenflies.webp";
    case "iron_ore":
      return "/items/iron-ore.webp";
    case "clay":
      return "/items/clay.webp";
    case "glass":
      return "/items/glass.webp";
    case "paper":
      return "/items/paper.webp";
    case "crucible":
      return "/items/crucible.webp";
    case "iron_ingot":
      return "/items/iron-ingot.webp";
    case "roof_tile":
      return "/items/roof-tile.webp";
    case "wheelbarrel":
      return "/items/wheelbarrel.webp";
    case "paving_stone":
      return "/items/paving-stone.webp";
    case "plank":
      return "/items/plank.webp";
    case "hoe":
      return "/items/hoe.webp";
    case "mushroom":
      return "/items/mushroom.webp";
    case "pasta":
      return "/items/pasta.webp";
    case "rotten_apple":
      return "/items/rotten-apple.webp";
    case "stuffed_fly":
      return "/items/stuffed-fly.webp";
    case "seeds":
      return "/items/seeds.webp";
    case "gravel":
      return "/items/gravel.webp";
    case "concrete":
      return "/items/concrete.webp";
    case "steel":
      return "/items/steel.webp";
    case "basket":
      return "/items/basket.webp";
    case "furniture":
      return "/items/furniture.webp";
    case "sculpture":
      return "/items/sculpture.webp";
    case "desk":
      return "/items/desk.webp";
    case "fountain":
      return "/items/fountain.webp";
    case "book":
      return "/items/book.webp";
    case "flower":
      return "/items/flowers.webp";
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
    case "iron_ore":
      return "/stacks/iron-ore-pile.webp";
    case "clay":
      return "/stacks/clay-pile.webp";
    case "glass":
      return "/stacks/glass-pile.webp";
    case "rotten_apple":
      return "/stacks/apples-stack.webp";
    case "paper":
      return "/stacks/paper-stack.webp";
    case "seeds":
      return "/stacks/seeds-pile.webp";
    case "gravel":
      return "/stacks/gravel-stack.webp";
    default:
      throw new Error(`Unstackable item type: ${itemType}`);
  }
}
