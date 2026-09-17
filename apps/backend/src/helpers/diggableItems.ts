import { DiggableType, Positionable, StructureType } from "@happy-little-bug-town/utils";

const ITEM_TYPES_WEIGHTS_FOR_HOLE = {
  leaf_part: 42 / 122,
  little_rock: 30 / 122,
  root: 9 / 122,
  stick: 35 / 122,
  beetle: 6 / 122,
};

const ITEM_TYPES_WEIGHTS_FOR_ANTHILL = {
  leaf_part: 31 / 174,
  little_rock: 27 / 174,
  root: 3 / 174,
  stick: 36 / 174,
  beetle: 1 / 174,
  iron_ore: 16 / 174,
  clay: 12 / 174,
  greenfly: 12 / 174,
  glass: 10 / 174,
  paper: 26 / 174,
};

const ITEM_TYPES_WEIGHTS_FOR_TERMITE_HILL = {
  leaf_part: 28 / 186,
  little_rock: 21 / 186,
  root: 0 / 186,
  stick: 27 / 186,
  beetle: 0 / 186,
  iron_ore: 31 / 186,
  clay: 6 / 186,
  greenfly: 12 / 186,
  glass: 3 / 186,
  paper: 9 / 186,
  gravel: 20 / 186,
  seeds: 20 / 186,
  rotten_apple: 9 / 186,
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
