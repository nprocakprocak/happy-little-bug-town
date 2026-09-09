import { StructureType } from "@happy-little-bug-town/utils";

export function structureTypeToDescription(structureType: StructureType): string | undefined {
  switch (structureType) {
    case "beetle_house":
      return "All beetles can be dropped here";
    case "workshop":
      return "Allows to craft useful tools";
    case "woodcutter":
      return "Produces timber and other wooden items";
    case "stonemason":
      return "Produces bricks and other stone items";
    case "kitchen":
      return "Cooks various food types";
    case "tavern":
      return "Attracts other bugs";
    case "smelter":
      return "Allows producing metal items";
    case "greenfly_house":
      return "House for greenflies";
    case "farm":
      return "Makes it possible to plow farm fields";
    case "library":
      return "Produces books";
    case "town_hall":
      return "Attracts bees";
    default:
      return undefined;
  }
}
