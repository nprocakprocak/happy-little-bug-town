import {
  BEETLE_HOUSE_SPAN,
  COMPOSTER_SPAN,
  FARM_SPAN,
  FLOWERS_FIELD_SPAN,
  GREENFLY_HOUSE_SPAN,
  GROUND_EVOLUTION_SPAN,
  KITCHEN_SPAN,
  LIBRARY_SPAN,
  MUSHROOMS_FIELD_SPAN,
  SMELTER_SPAN,
  STONEMASON_SPAN,
  TAVERN_SPAN,
  TOWN_HALL_SPAN,
  WOODCUTTER_SPAN,
  WORKSHOP_SPAN,
} from "../constants/game.js";
import { StructureType } from "../types/structureType.js";

export function getStructureSpan(structureType: StructureType): number {
  switch (structureType) {
    case "hole":
    case "anthill":
    case "termite_mound":
      return GROUND_EVOLUTION_SPAN;
    case "workshop":
      return WORKSHOP_SPAN;
    case "stonemason":
      return STONEMASON_SPAN;
    case "woodcutter":
      return WOODCUTTER_SPAN;
    case "kitchen":
      return KITCHEN_SPAN;
    case "tavern":
      return TAVERN_SPAN;
    case "smelter":
      return SMELTER_SPAN;
    case "farm":
      return FARM_SPAN;
    case "library":
      return LIBRARY_SPAN;
    case "town_hall":
      return TOWN_HALL_SPAN;
    case "mushrooms_field":
      return MUSHROOMS_FIELD_SPAN;
    case "flowers_field":
      return FLOWERS_FIELD_SPAN;
    case "composter":
      return COMPOSTER_SPAN;
    case "beetle_house":
      return BEETLE_HOUSE_SPAN;
    case "greenfly_house":
      return GREENFLY_HOUSE_SPAN;
  }
}
