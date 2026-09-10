import { createElement } from "react";
import {
  BugType,
  getBugFoodCount,
  getBugFoodRequirement,
  getCompletedUpgradeLevel,
  isBugFed,
  isStructurePowered,
  ItemType,
} from "@happy-little-bug-town/utils";

import { AutomateTransportInfographic } from "../components/dialogue/AutomateTransportInfographic";
import { BricksProductionInfographic } from "../components/dialogue/BricksProductionInfographic";
import { CookingListInfographic } from "../components/dialogue/CookingListInfographic";
import { HungryBugInfographic } from "../components/dialogue/HungryBugInfographic";
import { LeafToBeetleInfographic } from "../components/dialogue/LeafToBeetleInfographic";
import { ProcessIronInfographic } from "../components/dialogue/ProcessIronInfographic";
import { StackingItemsInfographic } from "../components/dialogue/StackingItemsInfographic";
import { StickToHoleInfographic } from "../components/dialogue/StickToHoleInfographic";
import { StonemasonListInfographic } from "../components/dialogue/StonemasonListInfographic";
import { TavernListInfographic } from "../components/dialogue/TavernListInfographic";
import { WoodcutterListInfographic } from "../components/dialogue/WoodcutterListInfographic";
import { WoodProductionInfographic } from "../components/dialogue/WoodProductionInfographic";
import { hasDialogueBust } from "../components/helpers/characterImages";
import { Bug } from "../types/bug";
import { CannotBuildReason, Dialogue } from "../types/dialogue";
import { Structure } from "../types/structure";

function getItemName(itemType: ItemType): string | null {
  switch (itemType) {
    case "leaf_part":
      return "little leaf";
    case "stick":
      return "stick";
    case "little_rock":
      return "stone";
    case "root":
      return "plant root";
    default:
      return null;
  }
}

export function welcomeDialogue(holeId: string): Dialogue {
  return {
    id: "welcome",
    text: "Look! It's a hole in the ground. Click it to dig.",
    cursorEntityId: holeId,
  };
}

export function dugFirstItemDialogue(itemType: ItemType): Dialogue | null {
  const name = getItemName(itemType);
  if (!name) {
    return null;
  }
  return {
    id: "dugFirstItem",
    text: `It's a ${name}. Maybe we can use it somehow? Keep digging.`,
  };
}

export function dugFirstBeetleDialogue(): Dialogue {
  return {
    id: "dugFirstBeetle",
    text: "Bonjour! My name is Bob. You wouldn't happen to have something to eat, would you?",
    bugType: "beetle",
  };
}

export function feedBeetleDialogue(): Dialogue {
  return {
    id: "feedBeetle",
    text: "Drag and drop two leaves on the beetle to feed it.",
    infographic: createElement(LeafToBeetleInfographic),
  };
}

export function hungryBugDialogue(bug: Bug): Dialogue | null {
  if (isBugFed(bug)) {
    return null;
  }

  const requirement = getBugFoodRequirement(bug.bugType);
  if (!requirement) {
    return null;
  }

  const infographic = createElement(HungryBugInfographic, {
    foodItemType: requirement.itemType,
    foodCount: getBugFoodCount(bug),
    maxCount: requirement.maxCount,
  });

  if (bug.bugType === "greenfly") {
    return {
      id: bug.bugType,
      text: "We must fatten up this greenfly before cooking.",
      bugType: "ant",
      infographic,
    };
  }

  return {
    id: bug.bugType,
    text: "I'm too hungry to work",
    bugType: hasDialogueBust(bug.bugType) ? bug.bugType : undefined,
    infographic,
  };
}

export function buildBeetleHouseDialogue(beetleId: string): Dialogue {
  return {
    id: "buildBeetleHouse",
    text: 'Oh, thank you! I think I will stay here for a little longer. I can build a house for myself and my cousins. Just click me and select "Beetle house". Then drop the required resources on the construction site.',
    bugType: "beetle",
    cursorEntityId: beetleId,
  };
}

export function buildWorkshopDialogue(beetleId: string): Dialogue {
  return {
    id: "buildWorkshop",
    text: "Wow, that's a nice house we can all live in. Let's build a workshop so we could craft tools that will make our lives easier.",
    bugType: "beetle",
    cursorEntityId: beetleId,
  };
}

export function craftAxeDialogue(workshopId: string): Dialogue {
  return {
    id: "craftAxe",
    text: "Craft an axe so we can turn sticks into usable wood.",
    bugType: "beetle",
    cursorEntityId: workshopId,
  };
}

export function buildWoodcutterDialogue(beetleId?: string): Dialogue {
  return {
    id: "buildWoodcutter",
    text: "Build a woodcutter and drop some sticks on it to create wood.",
    bugType: "beetle",
    cursorEntityId: beetleId,
  };
}

export function woodProductionDialogue(): Dialogue {
  return {
    id: "woodProduction",
    text: "Our beetles will produce wood in this woodcutter. Drop some sticks to start producing. Then click the building to craft the item.",
    bugType: "beetle",
    infographic: createElement(WoodProductionInfographic),
  };
}

export function buildStonemasonDialogue(beetleId?: string): Dialogue {
  return {
    id: "buildStonemason",
    text: "Great! Let's build stonemason and produce some bricks. You will need hammers and chisels for that purpose. You can find them in the workshop.",
    bugType: "beetle",
    cursorEntityId: beetleId,
    infographic: createElement(BricksProductionInfographic),
  };
}

export function bricksProductionDialogue(): Dialogue {
  return {
    id: "bricksProduction",
    text: "You can produce bricks from stones here.",
    bugType: "beetle",
    infographic: createElement(BricksProductionInfographic),
  };
}

export function smelterDialogue(): Dialogue {
  return {
    id: "smelter",
    text: "Smelter processes iron and clay. You will be able to process more items after upgrading the building.",
    bugType: "ant",
    infographic: createElement(ProcessIronInfographic),
  };
}

export function cookingListDialogue(): Dialogue {
  return {
    id: "cookingList",
    text: "You can cook tasty meals here that will make other bugs visit our town.",
    bugType: "beetle",
    infographic: createElement(CookingListInfographic),
  };
}

export function tavernListDialogue(): Dialogue {
  return {
    id: "tavernList",
    text: "We can attract other bugs by serving their favorite food here in this tavern.",
    bugType: "beetle",
    infographic: createElement(TavernListInfographic),
  };
}

export function buildKitchenDialogue(): Dialogue {
  return {
    id: "buildKitchen",
    text: "Hurray! We can now build a kitchen. Check out the workshop for the required tools.",
    bugType: "beetle",
  };
}

export function buildTavernDialogue(): Dialogue {
  return {
    id: "buildTavern",
    text: "This kitchen will produce various types of food. Let's now build a tavern that will hopefully attract more bugs.",
    bugType: "beetle",
  };
}

export function cookNettleSoupDialogue(): Dialogue {
  return {
    id: "cookNettleSoup",
    text: "That's so awesome! We can now invite friends to our little village. Let's cook some nettle soup in the kitchen and place it in the tavern.",
    bugType: "beetle",
  };
}

export function firstAntDialogue(): Dialogue {
  return {
    id: "firstAnt",
    text: "Hello there! What a nice little village you have here. I would love to see it more prosperous. If you drop enough ants into the hole, we will turn it into an anthill.",
    bugType: "ant",
  };
}

export function digMoreResourcesDialogue(anthillId: string): Dialogue {
  return {
    id: "digMoreResources",
    text: "Great! Thanks to our work this land is more fertile now. We can also dig more resources from the hole.",
    bugType: "ant",
    cursorEntityId: anthillId,
  };
}

export function automateWithAntsDialogue(): Dialogue {
  return {
    id: "automateWithAnts",
    text: "Me and other ants can help you carry items if you want. Just drop us on a stack and we will deliver items to that stack automatically.",
    bugType: "ant",
    infographic: createElement(AutomateTransportInfographic),
  };
}

export function firstGreenflyDialogue(): Dialogue {
  return {
    id: "firstGreenfly",
    text: "Look. A greenfly! This is ladybugs' favorite food. Let's fatten it up and prepare it in the kitchen.",
    bugType: "ant",
  };
}

export function firstIronOreDialogue(): Dialogue {
  return {
    id: "firstIronOre",
    text: "We can process this iron ore in a smelter. I think the beetles can build one.",
    bugType: "ant",
  };
}

export function firstLadybugDialogue(ladybugId: string): Dialogue {
  return {
    id: "firstLadybug",
    text: "Mmm. That was yummy! Hey, you know what? I can upgrade buildings for you. Let's start with the workshop.",
    bugType: "ladybug",
    cursorEntityId: ladybugId,
  };
}

export function buildFarmDialogue(): Dialogue {
  return {
    id: "buildFarm",
    text: "With this new set of handy tools we should be able to turn our village into a beautiful small town. Let's upgrade more buildings and produce more items to be able to construct a farm.",
    bugType: "ladybug",
  };
}

export function stonemasonUpgradedDialogue(): Dialogue {
  return {
    id: "stonemasonUpgraded",
    text: "You can now produce paving stones from the stone bricks. Upgrade even more to make sculptures.",
    bugType: "ladybug",
    infographic: createElement(StonemasonListInfographic),
  };
}

export function woodcutterUpgradedDialogue(): Dialogue {
  return {
    id: "woodcutterUpgraded",
    text: "The woodcutter can now provide you with planks. Upgrade the building if you want to produce furniture.",
    bugType: "ladybug",
    infographic: createElement(WoodcutterListInfographic),
  };
}

export function cannotBuildDialogue(reason: CannotBuildReason): Dialogue {
  switch (reason) {
    case "noSpace":
      return {
        id: "cannotBuild",
        text: "There's not enough space to build this. You can drop items back to the hole to make some room.",
        bugType: "beetle",
        infographic: createElement(StickToHoleInfographic),
      };
  }
}

export function cannotPlaceDialogue(): Dialogue {
  return {
    id: "cannotPlace",
    text: "There's not enough space to place an item. You can drop items back to the hole to make some room.",
    bugType: "beetle",
    infographic: createElement(StickToHoleInfographic),
  };
}

function isUpgradedAndPowered(structure: Structure): boolean {
  return getCompletedUpgradeLevel(structure) >= 1 && isStructurePowered(structure);
}

export function structureClickDialogue(structure: Structure): Dialogue | null {
  switch (structure.structureType) {
    case "woodcutter":
      if (isUpgradedAndPowered(structure)) {
        return woodcutterUpgradedDialogue();
      }
      return woodProductionDialogue();
    case "stonemason":
      if (isUpgradedAndPowered(structure)) {
        return stonemasonUpgradedDialogue();
      }
      return bricksProductionDialogue();
    case "kitchen":
      return cookingListDialogue();
    case "tavern":
      return tavernListDialogue();
    case "smelter":
      return smelterDialogue();
    default:
      return null;
  }
}

export function itemClickDialogue(itemType: ItemType): Dialogue | null {
  switch (itemType) {
    case "leaf_part":
      return {
        id: "leaf_part",
        text: "This leaf can be used to feed a bug or to build something.",
      };
    case "little_rock":
      return {
        id: "little_rock",
        text: "Stone is a good building material.",
      };
    case "root":
      return {
        id: "root",
        text: "We can use this plant root to craft a tool or a structure.",
      };
    case "stick":
      return {
        id: "stick",
        text: "Use stick as a building material or crafting resource.",
      };
    case "iron_ore":
      return firstIronOreDialogue();
    case "leaf_rake":
      return {
        id: "leaf_rake",
        text: "Thanks to the rake you can stack light items: sticks, leaves and roots.",
        bugType: "beetle",
        infographic: createElement(StackingItemsInfographic),
      };
    case "wheelbarrel":
      return {
        id: "wheelbarrel",
        text: "The wheelbarrel allows you to stack heavy items: rocks, iron ore, clay, glass and gravel.",
        bugType: "ladybug",
      };
    default:
      return null;
  }
}

export function bugClickDialogue(bugType: BugType): Dialogue | null {
  switch (bugType) {
    case "ant":
      return automateWithAntsDialogue();
    case "greenfly":
      return {
        id: "greenfly",
        text: "Greenflies are ladybugs' favorite food. Cook them in the kitchen.",
        bugType: "ant",
      };
    case "fly":
      return {
        id: "fly",
        text: "Put the fly in the kitchen to prepare a special meal to attract spiders.",
        bugType: "beetle",
      };
    default:
      return null;
  }
}
