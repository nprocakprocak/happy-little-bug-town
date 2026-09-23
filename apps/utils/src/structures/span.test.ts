import { describe, expect, it } from "vitest";
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
import { getStructureSpan } from "./span.js";

describe("structure span", () => {
  const spans: { structureType: StructureType; span: number }[] = [
    { structureType: "hole", span: GROUND_EVOLUTION_SPAN },
    { structureType: "anthill", span: GROUND_EVOLUTION_SPAN },
    { structureType: "termite_mound", span: GROUND_EVOLUTION_SPAN },
    { structureType: "beehive", span: GROUND_EVOLUTION_SPAN },
    { structureType: "workshop", span: WORKSHOP_SPAN },
    { structureType: "stonemason", span: STONEMASON_SPAN },
    { structureType: "woodcutter", span: WOODCUTTER_SPAN },
    { structureType: "kitchen", span: KITCHEN_SPAN },
    { structureType: "tavern", span: TAVERN_SPAN },
    { structureType: "smelter", span: SMELTER_SPAN },
    { structureType: "farm", span: FARM_SPAN },
    { structureType: "library", span: LIBRARY_SPAN },
    { structureType: "town_hall", span: TOWN_HALL_SPAN },
    { structureType: "mushrooms_field", span: MUSHROOMS_FIELD_SPAN },
    { structureType: "flowers_field", span: FLOWERS_FIELD_SPAN },
    { structureType: "composter", span: COMPOSTER_SPAN },
    { structureType: "beetle_house", span: BEETLE_HOUSE_SPAN },
    { structureType: "greenfly_house", span: GREENFLY_HOUSE_SPAN },
  ];

  it("maps every structure type to its footprint", () => {
    for (const { structureType, span } of spans) {
      expect(getStructureSpan(structureType)).toBe(span);
    }
  });
});
