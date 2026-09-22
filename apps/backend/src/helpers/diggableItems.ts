import { BugType, DiggableType, ItemType, StructureType } from "@happy-little-bug-town/utils";

const DIGGABLE_TYPE_BY_KEY: Record<DiggableType, true> = {
  leaf_part: true,
  little_rock: true,
  root: true,
  stick: true,
  beetle: true,
  iron_ore: true,
  clay: true,
  greenfly: true,
  glass: true,
  paper: true,
  rotten_apple: true,
  seeds: true,
  gravel: true,
};

const DIGGABLE_TYPES_FOR_HOLE: DiggableType[] = [
  "leaf_part",
  "little_rock",
  "root",
  "stick",
  "beetle",
];

const DIGGABLE_TYPES_FOR_ANTHILL: DiggableType[] = [
  ...DIGGABLE_TYPES_FOR_HOLE,
  "iron_ore",
  "clay",
  "greenfly",
  "glass",
  "paper",
];

const DIGGABLE_TYPES_FOR_TERMITE_MOUND: DiggableType[] = [
  ...DIGGABLE_TYPES_FOR_ANTHILL,
  "gravel",
  "seeds",
  "rotten_apple",
];

function isDiggableType(value: string): value is DiggableType {
  return Object.prototype.hasOwnProperty.call(DIGGABLE_TYPE_BY_KEY, value);
}

function getAvailableDiggableTypes(structureType: StructureType): DiggableType[] {
  if (structureType === "termite_mound" || structureType === "beehive") {
    return DIGGABLE_TYPES_FOR_TERMITE_MOUND;
  }
  if (structureType === "anthill") {
    return DIGGABLE_TYPES_FOR_ANTHILL;
  }
  return DIGGABLE_TYPES_FOR_HOLE;
}

function countOwnedDiggableTypes(
  items: { itemType: ItemType }[],
  bugs: { bugType: BugType }[],
): Partial<Record<DiggableType, number>> {
  const counts: Partial<Record<DiggableType, number>> = {};

  for (const item of items) {
    if (!isDiggableType(item.itemType)) {
      continue;
    }
    counts[item.itemType] = (counts[item.itemType] ?? 0) + 1;
  }

  for (const bug of bugs) {
    if (!isDiggableType(bug.bugType)) {
      continue;
    }
    counts[bug.bugType] = (counts[bug.bugType] ?? 0) + 1;
  }

  return counts;
}

function getScarcityWeight(count: number): number {
  return 1 / (count + 1);
}

function pickWeightedDiggableType(
  types: DiggableType[],
  counts: Partial<Record<DiggableType, number>>,
): DiggableType {
  const weights = types.map((type) => getScarcityWeight(counts[type] ?? 0));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let seed = Math.random() * totalWeight;

  for (let index = 0; index < types.length; index += 1) {
    seed -= weights[index];
    if (seed < 0) {
      return types[index];
    }
  }

  return types[types.length - 1];
}

function getMissingDiggableTypes(
  types: DiggableType[],
  counts: Partial<Record<DiggableType, number>>,
): DiggableType[] {
  return types.filter((type) => (counts[type] ?? 0) === 0);
}

export function generateDiggableItem(
  structureType: StructureType,
  items: { itemType: ItemType }[],
  bugs: { bugType: BugType }[],
): DiggableType {
  const availableTypes = getAvailableDiggableTypes(structureType);
  const counts = countOwnedDiggableTypes(items, bugs);
  const missingTypes = getMissingDiggableTypes(availableTypes, counts);
  if (missingTypes.length > 0) {
    return pickWeightedDiggableType(missingTypes, counts);
  }
  return pickWeightedDiggableType(availableTypes, counts);
}
