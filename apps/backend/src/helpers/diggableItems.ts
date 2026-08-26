import { DiggableType, StructureType } from "@happy-little-bug-town/utils";

const ITEM_TYPES_WEIGHTS_FOR_HOLE = {
  beetle: 0.2,
  root: 0.4,
  leaf_part: 0.6,
  little_rock: 0.8,
  stick: 1,
};

const ITEM_TYPES_WEIGHTS_FOR_ANTHILL = {
  iron_ore: 0.2,
  clay: 0.5,
  greenfly: 0.8,
  glass: 0.9,
  paper: 1,
};

const ITEM_TYPES_WEIGHTS_FOR_TERMITE_HILL = {
  rotten_apple: 1,
};

const HOLE_SHARE_WHEN_ANTHILL_EXISTS = 0.3;
const ANTHILL_SHARE_WHEN_ANTHILL_EXISTS = 0.7;

const HOLE_SHARE_WHEN_TERMITE_HILL_EXISTS = 0.2;
const ANTHILL_SHARE_WHEN_TERMITE_HILL_EXISTS = 0.3;
const TERMITE_HILL_SHARE_WHEN_TERMITE_HILL_EXISTS = 0.5;

function combineCumulativeWeights(
  tables: { weights: Record<string, number>; share: number }[],
): Record<string, number> {
  const combined: Record<string, number> = {};
  let cumulative = 0;

  for (const table of tables) {
    let previousThreshold = 0;
    for (const itemType of Object.keys(table.weights)) {
      cumulative += (table.weights[itemType] - previousThreshold) * table.share;
      combined[itemType] = cumulative;
      previousThreshold = table.weights[itemType];
    }
  }

  return combined;
}

const ANTHILL_WEIGHTS = combineCumulativeWeights([
  { weights: ITEM_TYPES_WEIGHTS_FOR_HOLE, share: HOLE_SHARE_WHEN_ANTHILL_EXISTS },
  { weights: ITEM_TYPES_WEIGHTS_FOR_ANTHILL, share: ANTHILL_SHARE_WHEN_ANTHILL_EXISTS },
]);

const TERMITE_HILL_WEIGHTS = combineCumulativeWeights([
  { weights: ITEM_TYPES_WEIGHTS_FOR_HOLE, share: HOLE_SHARE_WHEN_TERMITE_HILL_EXISTS },
  { weights: ITEM_TYPES_WEIGHTS_FOR_ANTHILL, share: ANTHILL_SHARE_WHEN_TERMITE_HILL_EXISTS },
  {
    weights: ITEM_TYPES_WEIGHTS_FOR_TERMITE_HILL,
    share: TERMITE_HILL_SHARE_WHEN_TERMITE_HILL_EXISTS,
  },
]);

function pickRandomItemType(weights: Record<string, number>, fallback: DiggableType): DiggableType {
  const seed = Math.random();
  const itemType = Object.keys(weights).find((type) => seed < weights[type]);
  if (itemType === undefined) {
    return fallback;
  }
  return itemType as DiggableType;
}

export function generateRandomItemType(structureType: StructureType): DiggableType {
  if (structureType === "termite_mound") {
    return pickRandomItemType(
      TERMITE_HILL_WEIGHTS,
      "rotten_apple",
    );
  }
  if (structureType === "anthill") {
    return pickRandomItemType(ANTHILL_WEIGHTS, "iron_ore");
  }
  return pickRandomItemType(ITEM_TYPES_WEIGHTS_FOR_HOLE, "leaf_part");
}
