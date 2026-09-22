import {
  getCompletedUpgradeLevel,
  getStructureUpgradeLevels,
  isStructureBuilt,
  isStructurePowered,
  OnceDialogueId,
  UpgradableStructureType,
} from "@happy-little-bug-town/utils";

import { DialogueId } from "../types/dialogue";
import { Item } from "../types/item";
import { Stack } from "../types/stack";
import { Structure } from "../types/structure";

interface QuestContext {
  visitedDialogueIds: OnceDialogueId[];
  activeDialogueId: DialogueId | null;
  structures: Structure[];
  items: Item[];
  stacks: Stack[];
}

interface Quest {
  id: string;
  text: string;
  isActive: (context: QuestContext) => boolean;
}

function hasClosedDialogue(context: QuestContext, dialogueId: OnceDialogueId): boolean {
  return context.visitedDialogueIds.includes(dialogueId) && context.activeDialogueId !== dialogueId;
}

function hasItemOnBoard(context: QuestContext, itemType: Item["itemType"]): boolean {
  return (
    context.items.some((item) => item.itemType === itemType) ||
    context.stacks.some((stack) => stack.itemType === itemType)
  );
}

function hasFullyBuiltStructure(
  context: QuestContext,
  structureType: Structure["structureType"],
): boolean {
  return context.structures.some(
    (structure) =>
      structure.structureType === structureType &&
      isStructureBuilt(structure) &&
      isStructurePowered(structure),
  );
}

function hasUpgradedStructure(
  context: QuestContext,
  structureType: Structure["structureType"],
): boolean {
  return context.structures.some(
    (structure) =>
      structure.structureType === structureType &&
      isStructureBuilt(structure) &&
      getCompletedUpgradeLevel(structure) >= 1 &&
      isStructurePowered(structure),
  );
}

function hasMaxUpgradedStructure(
  context: QuestContext,
  structureType: UpgradableStructureType,
): boolean {
  const maxLevel = Math.max(...getStructureUpgradeLevels(structureType));
  return context.structures.some(
    (structure) =>
      structure.structureType === structureType &&
      isStructureBuilt(structure) &&
      getCompletedUpgradeLevel(structure) >= maxLevel &&
      isStructurePowered(structure),
  );
}

const QUESTS: Quest[] = [
  {
    id: "buildBeetleHouse",
    text: "Build a beetle house by clicking the beetle.",
    isActive: (context) => hasClosedDialogue(context, "buildBeetleHouse"),
  },
  {
    id: "buildWorkshop",
    text: "Build a workshop.",
    isActive: (context) => hasClosedDialogue(context, "buildWorkshop"),
  },
  {
    id: "craftAxe",
    text: "Craft an axe in the workshop.",
    isActive: (context) => hasClosedDialogue(context, "craftAxe"),
  },
  {
    id: "buildWoodcutter",
    text: "Build a woodcutter using a beetle.",
    isActive: (context) => hasClosedDialogue(context, "buildWoodcutter"),
  },
  {
    id: "woodProduction",
    text: "Craft a wooden beam by dropping sticks on the woodcutter.",
    isActive: (context) => hasClosedDialogue(context, "woodProduction"),
  },
  {
    id: "buildStonemason",
    text: "Build a stonemason and produce some bricks.",
    isActive: (context) => hasClosedDialogue(context, "buildStonemason"),
  },
  {
    id: "buildKitchen",
    text: "Build a kitchen.",
    isActive: (context) => hasClosedDialogue(context, "buildKitchen"),
  },
  {
    id: "buildTavern",
    text: "Build a tavern.",
    isActive: (context) => hasClosedDialogue(context, "buildTavern"),
  },
  {
    id: "cookNettleSoup",
    text: "Cook nettle soup in the kitchen and supply the tavern.",
    isActive: (context) => hasClosedDialogue(context, "cookNettleSoup"),
  },
  {
    id: "firstAnt",
    text: "Drop three ants into the hole.",
    isActive: (context) => hasClosedDialogue(context, "firstAnt"),
  },
  {
    id: "digMoreResources",
    text: "Keep digging.",
    isActive: (context) => hasClosedDialogue(context, "digMoreResources"),
  },
  {
    id: "firstIronOre",
    text: "Build a smelter and craft an iron ingot.",
    isActive: (context) => hasClosedDialogue(context, "firstIronOre"),
  },
  {
    id: "digEvenMoreResources",
    text: "Keep digging.",
    isActive: (context) =>
      !hasClosedDialogue(context, "firstGreenfly") &&
      hasFullyBuiltStructure(context, "smelter") &&
      hasItemOnBoard(context, "iron_ingot"),
  },
  {
    id: "firstGreenfly",
    text: "Cook a greenfly and attract a ladybug to the tavern.",
    isActive: (context) =>
      hasClosedDialogue(context, "firstGreenfly") && hasFullyBuiltStructure(context, "smelter"),
  },
  {
    id: "firstLadybug",
    text: "Use a ladybug to upgrade the workshop.",
    isActive: (context) => hasClosedDialogue(context, "firstLadybug"),
  },
  {
    id: "upgradeWithLadybugs",
    text: "Summon more ladybugs and upgrade the stonemason and the woodcutter.",
    isActive: (context) => hasClosedDialogue(context, "buildFarm"),
  },
  {
    id: "buildFarm",
    text: "Build a farm.",
    isActive: (context) => hasClosedDialogue(context, "woodcutterUpgraded"),
  },
  {
    id: "buildMushroomField",
    text: "Build a mushroom field at the farm.",
    isActive: (context) => hasClosedDialogue(context, "buildMushroomField"),
  },
  {
    id: "growMushrooms",
    text: "Grow mushrooms using scraps of paper.",
    isActive: (context) => hasClosedDialogue(context, "mushroomField"),
  },
  {
    id: "upgradeKitchen",
    text: "Upgrade the kitchen using ladybugs.",
    isActive: (context) =>
      hasClosedDialogue(context, "firstMushroom") && !hasUpgradedStructure(context, "kitchen"),
  },
  {
    id: "attractTermites",
    text: "Attract termites to the tavern using mushroom sauce.",
    isActive: (context) =>
      hasClosedDialogue(context, "firstMushroom") && hasUpgradedStructure(context, "kitchen"),
  },
  {
    id: "firstTermite",
    text: "Drop three termites into the anthill.",
    isActive: (context) => hasClosedDialogue(context, "firstTermite"),
  },
  {
    id: "termiteMound",
    text: "Keep digging.",
    isActive: (context) => hasClosedDialogue(context, "termiteMound"),
  },
  {
    id: "firstRottenApple",
    text: "Build a composter at the farm.",
    isActive: (context) => hasClosedDialogue(context, "firstRottenApple"),
  },
  {
    id: "composter",
    text: "Catch a fly at the composter and cook it to attract spiders.",
    isActive: (context) => hasClosedDialogue(context, "composter"),
  },
  {
    id: "upgradeSmelter",
    text: "Upgrade the smelter.",
    isActive: (context) => hasClosedDialogue(context, "firstSpider"),
  },
  {
    id: "upgradeStonemasonAndWoodcutter",
    text: "Upgrade the stonemason and the woodcutter to the max level.",
    isActive: (context) =>
      hasClosedDialogue(context, "firstSpider") && hasUpgradedStructure(context, "smelter"),
  },
  {
    id: "upgradeWorkshop",
    text: "Upgrade the workshop to the max level.",
    isActive: (context) =>
      hasClosedDialogue(context, "firstSpider") &&
      hasMaxUpgradedStructure(context, "stonemason") &&
      hasMaxUpgradedStructure(context, "woodcutter"),
  },
  {
    id: "buildLibrary",
    text: "Build a library.",
    isActive: (context) =>
      hasClosedDialogue(context, "firstSpider") && hasMaxUpgradedStructure(context, "workshop"),
  },
  {
    id: "library",
    text: "Build the town hall.",
    isActive: (context) => hasClosedDialogue(context, "library"),
  },
  {
    id: "townHall",
    text: "Grow some flowers at the farm. Use them to attract bees to the town hall.",
    isActive: (context) => hasClosedDialogue(context, "townHall"),
  },
  {
    id: "firstBee",
    text: "Drop three bees into the termite mound.",
    isActive: (context) => hasClosedDialogue(context, "firstBee"),
  },
];

export function getActiveQuestText(context: QuestContext): string | null {
  if (hasFullyBuiltStructure(context, "beehive")) {
    return null;
  }

  const quest = QUESTS.reduce<Quest | null>(
    (active, candidate) => (candidate.isActive(context) ? candidate : active),
    null,
  );
  return quest?.text ?? null;
}
