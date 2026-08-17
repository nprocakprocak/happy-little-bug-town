import { DiggableType } from "@happy-little-bug-town/utils";

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

const HOLE_SHARE_WHEN_ANTHILL_EXISTS = 0.3;
const ANTHILL_SHARE_WHEN_ANTHILL_EXISTS = 0.7;

function combineCumulativeWeights(
  firstWeights: Record<string, number>,
  secondWeights: Record<string, number>,
  firstShare: number,
  secondShare: number,
): Record<string, number> {
  const combined: Record<string, number> = {};
  let previousThreshold = 0;
  let cumulative = 0;

  for (const itemType of Object.keys(firstWeights)) {
    cumulative += (firstWeights[itemType] - previousThreshold) * firstShare;
    combined[itemType] = cumulative;
    previousThreshold = firstWeights[itemType];
  }

  previousThreshold = 0;
  for (const itemType of Object.keys(secondWeights)) {
    cumulative += (secondWeights[itemType] - previousThreshold) * secondShare;
    combined[itemType] = cumulative;
    previousThreshold = secondWeights[itemType];
  }

  return combined;
}

const ITEM_TYPES_WEIGHTS_FOR_ANTHILL_WITH_HOLE = combineCumulativeWeights(
  ITEM_TYPES_WEIGHTS_FOR_HOLE,
  ITEM_TYPES_WEIGHTS_FOR_ANTHILL,
  HOLE_SHARE_WHEN_ANTHILL_EXISTS,
  ANTHILL_SHARE_WHEN_ANTHILL_EXISTS,
);

function pickRandomItemType(weights: Record<string, number>, fallback: DiggableType): DiggableType {
  const seed = Math.random();
  const itemType = Object.keys(weights).find((type) => seed < weights[type]);
  if (itemType === undefined) {
    return fallback;
  }
  return itemType as DiggableType;
}

export function generateRandomItemType(includeAnthillItems: boolean): DiggableType {
  if (includeAnthillItems) {
    return pickRandomItemType(ITEM_TYPES_WEIGHTS_FOR_ANTHILL_WITH_HOLE, "iron_ore");
  }
  return pickRandomItemType(ITEM_TYPES_WEIGHTS_FOR_HOLE, "leaf_part");
}
