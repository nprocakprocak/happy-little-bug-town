import { StructureType } from "@happy-little-bug-town/utils";

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
      if (upgradeLevel >= 2) {
        return "/structures/workshop-lvl-3.webp";
      }
      return upgradeLevel >= 1 ? "/structures/workshop-lvl-2.webp" : "/structures/workshop.webp";
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
