import {
  BugType,
  getAssignedTermiteCapacity,
  getBuildResourceCosts,
  getUpgradeResourceCosts,
  isTermiteAssignableStructureType,
  ItemType,
  STRUCTURE_OPERATIONAL_RESOURCE_REQUIREMENTS,
  STRUCTURE_POWER_REQUIREMENTS,
  StructurePowerRequirement,
  StructureType,
} from "@happy-little-bug-town/utils";

interface DemolishItem {
  id: string;
  itemType: ItemType;
}

interface DemolishBug {
  id: string;
  bugType: BugType;
}

interface StructureForDemolish {
  structureType: StructureType;
  upgradeLevel: number;
  items: DemolishItem[];
  bugs: DemolishBug[];
}

type DemolishTarget =
  | { kind: "item"; id: string }
  | { kind: "bug"; id: string }
  | { kind: "structure" };

interface DemolishContents {
  craftItems: DemolishItem[];
  craftBugs: DemolishBug[];
  automationBugs: DemolishBug[];
  powerBugsByLevel: DemolishBug[][];
  powerItemsByLevel: DemolishItem[][];
  buildItemsByLevel: DemolishItem[][];
  remainingItems: DemolishItem[];
  remainingBugs: DemolishBug[];
}

function consumeItemsByType(
  remaining: DemolishItem[],
  itemType: ItemType,
  count: number,
): { taken: DemolishItem[]; remaining: DemolishItem[] } {
  if (count <= 0) {
    return { taken: [], remaining };
  }

  const taken: DemolishItem[] = [];
  const kept: DemolishItem[] = [];
  for (const item of remaining) {
    if (item.itemType === itemType && taken.length < count) {
      taken.push(item);
    } else {
      kept.push(item);
    }
  }

  return { taken, remaining: kept };
}

function consumeBugsByType(
  remaining: DemolishBug[],
  bugType: BugType,
  count: number,
): { taken: DemolishBug[]; remaining: DemolishBug[] } {
  if (count <= 0) {
    return { taken: [], remaining };
  }

  const taken: DemolishBug[] = [];
  const kept: DemolishBug[] = [];
  for (const bug of remaining) {
    if (bug.bugType === bugType && taken.length < count) {
      taken.push(bug);
    } else {
      kept.push(bug);
    }
  }

  return { taken, remaining: kept };
}

function getPowerRequirementAtLevel(
  structureType: StructureType,
  level: number,
): StructurePowerRequirement {
  return STRUCTURE_POWER_REQUIREMENTS[structureType]?.[level] ?? {};
}

function getBugPowerCount(requirement: StructurePowerRequirement, bugType: BugType): number {
  return (
    requirement.bugRequirements?.find((entry) => entry.bugType === bugType)?.requiredCount ?? 0
  );
}

function getItemPowerCount(requirement: StructurePowerRequirement, itemType: ItemType): number {
  return (
    requirement.itemRequirements?.find((entry) => entry.itemType === itemType)?.requiredCount ?? 0
  );
}

function consumePowerDelta(
  remainingItems: DemolishItem[],
  remainingBugs: DemolishBug[],
  structureType: StructureType,
  level: number,
): {
  powerItems: DemolishItem[];
  powerBugs: DemolishBug[];
  remainingItems: DemolishItem[];
  remainingBugs: DemolishBug[];
} {
  const current = getPowerRequirementAtLevel(structureType, level);
  const previous = level > 0 ? getPowerRequirementAtLevel(structureType, level - 1) : {};
  const powerItems: DemolishItem[] = [];
  const powerBugs: DemolishBug[] = [];
  let items = remainingItems;
  let bugs = remainingBugs;

  for (const requirement of current.bugRequirements ?? []) {
    const extra = Math.max(
      0,
      requirement.requiredCount - getBugPowerCount(previous, requirement.bugType),
    );
    const consumed = consumeBugsByType(bugs, requirement.bugType, extra);
    powerBugs.push(...consumed.taken);
    bugs = consumed.remaining;
  }

  for (const requirement of current.itemRequirements ?? []) {
    const extra = Math.max(
      0,
      requirement.requiredCount - getItemPowerCount(previous, requirement.itemType),
    );
    const consumed = consumeItemsByType(items, requirement.itemType, extra);
    powerItems.push(...consumed.taken);
    items = consumed.remaining;
  }

  return { powerItems, powerBugs, remainingItems: items, remainingBugs: bugs };
}

function getCraftIngredientTypes(
  structureType: StructureType,
  upgradeLevel: number,
): { itemTypes: Set<ItemType>; bugTypes: Set<BugType> } {
  const itemTypes = new Set<ItemType>();
  const bugTypes = new Set<BugType>();
  const outputsByLevel = STRUCTURE_OPERATIONAL_RESOURCE_REQUIREMENTS[structureType];
  if (!outputsByLevel) {
    return { itemTypes, bugTypes };
  }

  for (let level = 0; level <= upgradeLevel; level++) {
    const outputs = outputsByLevel[level];
    if (!outputs) {
      continue;
    }

    for (const requirement of Object.values(outputs)) {
      if ("itemType" in requirement) {
        itemTypes.add(requirement.itemType);
      }
      if ("bugType" in requirement) {
        bugTypes.add(requirement.bugType);
      }
    }
  }

  return { itemTypes, bugTypes };
}

function classifyDemolishContents(structure: StructureForDemolish): DemolishContents {
  const levelCount = structure.upgradeLevel + 1;
  const buildItemsByLevel: DemolishItem[][] = Array.from({ length: levelCount }, () => []);
  const powerItemsByLevel: DemolishItem[][] = Array.from({ length: levelCount }, () => []);
  const powerBugsByLevel: DemolishBug[][] = Array.from({ length: levelCount }, () => []);

  let remainingItems = [...structure.items];
  let remainingBugs = [...structure.bugs];

  const baseBuild = getBuildResourceCosts(structure.structureType) ?? [];
  for (const cost of baseBuild) {
    const consumed = consumeItemsByType(remainingItems, cost.itemType, cost.count);
    buildItemsByLevel[0].push(...consumed.taken);
    remainingItems = consumed.remaining;
  }

  const power0 = consumePowerDelta(remainingItems, remainingBugs, structure.structureType, 0);
  powerItemsByLevel[0] = power0.powerItems;
  powerBugsByLevel[0] = power0.powerBugs;
  remainingItems = power0.remainingItems;
  remainingBugs = power0.remainingBugs;

  for (let level = 1; level <= structure.upgradeLevel; level++) {
    for (const cost of getUpgradeResourceCosts(structure.structureType, level)) {
      const consumed = consumeItemsByType(remainingItems, cost.itemType, cost.count);
      buildItemsByLevel[level].push(...consumed.taken);
      remainingItems = consumed.remaining;
    }

    const power = consumePowerDelta(remainingItems, remainingBugs, structure.structureType, level);
    powerItemsByLevel[level] = power.powerItems;
    powerBugsByLevel[level] = power.powerBugs;
    remainingItems = power.remainingItems;
    remainingBugs = power.remainingBugs;
  }

  const automationBugs: DemolishBug[] = [];
  if (isTermiteAssignableStructureType(structure.structureType)) {
    const termiteCapacity = getAssignedTermiteCapacity(structure.structureType);
    const termites = consumeBugsByType(remainingBugs, "termite", termiteCapacity);
    automationBugs.push(...termites.taken);
    remainingBugs = termites.remaining;

    const remainingAutomationSlots = termiteCapacity - automationBugs.length;
    const ants = consumeBugsByType(remainingBugs, "ant", remainingAutomationSlots);
    automationBugs.push(...ants.taken);
    remainingBugs = ants.remaining;
  }

  const craftTypes = getCraftIngredientTypes(structure.structureType, structure.upgradeLevel);
  const craftItems: DemolishItem[] = [];
  const craftBugs: DemolishBug[] = [];
  const leftoverItems: DemolishItem[] = [];
  const leftoverBugs: DemolishBug[] = [];

  for (const item of remainingItems) {
    if (craftTypes.itemTypes.has(item.itemType)) {
      craftItems.push(item);
    } else {
      leftoverItems.push(item);
    }
  }

  for (const bug of remainingBugs) {
    if (craftTypes.bugTypes.has(bug.bugType)) {
      craftBugs.push(bug);
    } else {
      leftoverBugs.push(bug);
    }
  }

  return {
    craftItems,
    craftBugs,
    automationBugs,
    powerBugsByLevel,
    powerItemsByLevel,
    buildItemsByLevel,
    remainingItems: leftoverItems,
    remainingBugs: leftoverBugs,
  };
}

function pickLastItem(items: DemolishItem[]): DemolishTarget | undefined {
  const item = items[items.length - 1];
  if (!item) {
    return undefined;
  }
  return { kind: "item", id: item.id };
}

function pickLastBug(bugs: DemolishBug[]): DemolishTarget | undefined {
  const bug = bugs[bugs.length - 1];
  if (!bug) {
    return undefined;
  }
  return { kind: "bug", id: bug.id };
}

export function getNextDemolishTarget(structure: StructureForDemolish): DemolishTarget {
  const contents = classifyDemolishContents(structure);
  const craftItem = pickLastItem(contents.craftItems);
  if (craftItem) {
    return craftItem;
  }

  const craftBug = pickLastBug(contents.craftBugs);
  if (craftBug) {
    return craftBug;
  }

  const automationBug = pickLastBug(contents.automationBugs);
  if (automationBug) {
    return automationBug;
  }

  for (let level = structure.upgradeLevel; level >= 0; level--) {
    const powerBug = pickLastBug(contents.powerBugsByLevel[level] ?? []);
    if (powerBug) {
      return powerBug;
    }

    const powerItem = pickLastItem(contents.powerItemsByLevel[level] ?? []);
    if (powerItem) {
      return powerItem;
    }

    const buildItem = pickLastItem(contents.buildItemsByLevel[level] ?? []);
    if (buildItem) {
      return buildItem;
    }
  }

  const remainingBug = pickLastBug(contents.remainingBugs);
  if (remainingBug) {
    return remainingBug;
  }

  const remainingItem = pickLastItem(contents.remainingItems);
  if (remainingItem) {
    return remainingItem;
  }

  return { kind: "structure" };
}

export function getDemolishResultingUpgradeLevel(structure: StructureForDemolish): number {
  const contents = classifyDemolishContents(structure);
  let level = structure.upgradeLevel;

  while (level > 0) {
    const powerBugs = contents.powerBugsByLevel[level] ?? [];
    const powerItems = contents.powerItemsByLevel[level] ?? [];
    const buildItems = contents.buildItemsByLevel[level] ?? [];
    if (powerBugs.length > 0 || powerItems.length > 0 || buildItems.length > 0) {
      break;
    }
    level -= 1;
  }

  return level;
}
