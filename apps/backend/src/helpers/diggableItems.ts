import { DiggableType, Positionable, StructureType } from "@happy-little-bug-town/utils";

const ITEM_TYPES_WEIGHTS_FOR_HOLE = {
  leaf_part: 0.4,
  little_rock: 0.2,
  root: 0.1,
  stick: 0.2,
  beetle: 0.1,
};

const ITEM_TYPES_WEIGHTS_FOR_ANTHILL = {
  leaf_part: 0.2,
  little_rock: 0.125,
  root: 0.05,
  stick: 0.2,
  beetle: 0.05,
  iron_ore: 0.075,
  clay: 0.075,
  greenfly: 0.075,
  glass: 0.05,
  paper: 0.1,
};

const ITEM_TYPES_WEIGHTS_FOR_TERMITE_HILL = {
  leaf_part: 0.1,
  little_rock: 0.1,
  root: 0.05,
  stick: 0.05,
  beetle: 0.05,
  iron_ore: 0.15,
  clay: 0.05,
  greenfly: 0.05,
  glass: 0.05,
  paper: 0.05,
  gravel: 0.1,
  seeds: 0.1,
  rotten_apple: 0.1,
};

function pickRandomItemType(weights: Record<string, number>, fallback: DiggableType): DiggableType {
  const seed = Math.random();
  let cumulative = 0;
  for (const [itemType, probability] of Object.entries(weights)) {
    cumulative += probability;
    if (seed < cumulative) {
      return itemType as DiggableType;
    }
  }
  return fallback;
}

export function generateRandomItemType(structureType: StructureType): DiggableType {
  if (structureType === "termite_mound") {
    return pickRandomItemType(ITEM_TYPES_WEIGHTS_FOR_TERMITE_HILL, "rotten_apple");
  }
  if (structureType === "anthill") {
    return pickRandomItemType(ITEM_TYPES_WEIGHTS_FOR_ANTHILL, "paper");
  }
  return pickRandomItemType(ITEM_TYPES_WEIGHTS_FOR_HOLE, "stick");
}

export function generateDiggableItem(structureType: StructureType, entities: Positionable[]): DiggableType {
  if (entities.length <= 1) {
    return "leaf_part";
  } else if (entities.length === 4 && !entities.some((entity) => "bugType" in entity && entity.bugType === "beetle")) {
    return "beetle";
  }
  return generateRandomItemType(structureType);
}
