import {
  ANTHILL_SPAN,
  BEETLE_HOUSE_SPAN,
  HOLE_SPAN,
  FARM_SPAN,
  KITCHEN_SPAN,
  MUSHROOMS_FIELD_SPAN,
  SMELTER_SPAN,
  STONEMASON_SPAN,
  TAVERN_SPAN,
  WOODCUTTER_SPAN,
  WORKSHOP_SPAN,
} from "../constants/game.js";
import { StructureType } from "../types/structureType.js";

export function getStructureSpan(structureType: StructureType): number {
  switch (structureType) {
    case "hole":
      return HOLE_SPAN;
    case "anthill":
      return ANTHILL_SPAN;
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
    case "mushrooms_field":
      return MUSHROOMS_FIELD_SPAN;
    case "beetle_house":
      return BEETLE_HOUSE_SPAN;
  }
}
