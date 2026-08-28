import { BugType, isBugFed, ItemType, StructureType } from "@happy-little-bug-town/utils";

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

export function bugTypeToImage(bugType: BugType, isFed: boolean = true): string {
  switch (bugType) {
    case "beetle":
      return "/bugs/beetle.webp";
    case "ant":
      return "/bugs/ant.webp";
    case "ladybug":
      return "/bugs/ladybug.webp";
    case "termite":
      return "/bugs/termite.webp";
    case "fly":
      return "/bugs/fly.webp";
    case "spider":
      return "/bugs/spider.webp";
    case "greenfly":
      return isFed ? "/bugs/greenfly.webp" : "/items/greenfly-hungry.webp";
    case "bee":
      return "/bugs/bee.webp";
    default:
      throw new Error(`Unknown bug type: ${bugType}`);
  }
}

export function bugToImage(bug: { bugType: BugType; items: { itemType: ItemType }[] }): string {
  return bugTypeToImage(bug.bugType, isBugFed(bug));
}

export function structureTypeToImage(
  structureType: StructureType,
  upgradeLevel: number = 0,
): string {
  switch (structureType) {
    case "hole":
      return "/structures/hole.webp";
    case "anthill":
      return "/structures/anthill.webp";
    case "termite_mound":
      return "/structures/termite-mound.webp";
    case "beehive":
      return "/structures/beehive.webp";
    case "beetle_house":
      return "/structures/beetle-house.webp";
    case "greenfly_house":
      return "/structures/greenfly-house.webp";
    case "workshop":
      return "/structures/workshop.webp";
    case "stonemason":
      if (upgradeLevel >= 2) {
        return "/structures/stonemason-lvl-3.webp";
      }
      return upgradeLevel >= 1
        ? "/structures/stonemason-lvl-2.webp"
        : "/structures/stonemason.webp";
    case "woodcutter":
      if (upgradeLevel >= 2) {
        return "/structures/woodcutter-lvl-3.webp";
      }
      return upgradeLevel >= 1
        ? "/structures/woodcutter-lvl-2.webp"
        : "/structures/woodcutter.webp";
    case "kitchen":
      return upgradeLevel >= 1
        ? "/structures/field-kitchen-lvl-2.webp"
        : "/structures/field-kitchen.webp";
    case "tavern":
      return "/structures/tavern.webp";
    case "smelter":
      return upgradeLevel >= 1 ? "/structures/smelter-lvl-2.webp" : "/structures/smelter.webp";
    case "farm":
      return "/structures/farm.webp";
    case "library":
      return "/structures/library.webp";
    case "town_hall":
      return "/structures/town-hall.webp";
    case "mushrooms_field":
      return "/structures/mushrooms-field.webp";
    case "flowers_field":
      return "/items/flower-bed.webp";
    case "composter":
      return "/structures/composter.webp";
    default:
      throw new Error(`Unknown structure type: ${structureType}`);
  }
}
