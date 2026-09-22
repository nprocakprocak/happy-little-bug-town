import { createElement } from "react";
import {
  BugType,
  getBugFoodCount,
  getBugFoodRequirement,
  getCompletedUpgradeLevel,
  isBugFed,
  isStructureBuilt,
  isStructurePowered,
  ItemType,
} from "@happy-little-bug-town/utils";

import { AppleToFlyInfographic } from "../components/dialogue/AppleToFlyInfographic";
import { AutomateProductionInfographic } from "../components/dialogue/AutomateProductionInfographic";
import { AutomateTransportInfographic } from "../components/dialogue/AutomateTransportInfographic";
import { BricksProductionInfographic } from "../components/dialogue/BricksProductionInfographic";
import { CookingListInfographic } from "../components/dialogue/CookingListInfographic";
import { FlowersToBeeInfographic } from "../components/dialogue/FlowersToBeeInfographic";
import { HungryBugInfographic } from "../components/dialogue/HungryBugInfographic";
import { LeafToBeetleInfographic } from "../components/dialogue/LeafToBeetleInfographic";
import { PaperToBookInfographic } from "../components/dialogue/PaperToBookInfographic";
import { PaperToMushroomInfographic } from "../components/dialogue/PaperToMushroomInfographic";
import { ProcessIronInfographic } from "../components/dialogue/ProcessIronInfographic";
import { SeedsToFlowersInfographic } from "../components/dialogue/SeedsToFlowersInfographic";
import { StackingItemsInfographic } from "../components/dialogue/StackingItemsInfographic";
import { StickToHoleInfographic } from "../components/dialogue/StickToHoleInfographic";
import { StonemasonListInfographic } from "../components/dialogue/StonemasonListInfographic";
import { TavernListInfographic } from "../components/dialogue/TavernListInfographic";
import { UpgradeHoleInfographic } from "../components/dialogue/UpgradeHoleInfographic";
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
    text: "I'm too hungry to work.",
    bugType: hasDialogueBust(bug.bugType) ? bug.bugType : undefined,
    infographic,
  };
}

export function buildBeetleHouseDialogue(beetleId: string): Dialogue {
  return {
    id: "buildBeetleHouse",
    text: 'Oh, thank you! Actually, you know what? We beetles can build various structures. Let\'s build a house for me and my brothers. Just click me and select "Beetle house". Then drop the required resources on the construction site.',
    bugType: "beetle",
    cursorEntityId: beetleId,
  };
}

export function placeStructureDialogue(structureId: string): Dialogue {
  return {
    id: "placeStructure",
    text: "Drag the structure to place it anywhere you want.",
    bugType: "beetle",
    cursorEntityId: structureId,
  };
}

export function beetleHouseDialogue(): Dialogue {
  return {
    id: "beetleHouse",
    text: "This is our house. All the beetles that come from the hole will stay here. Collect 10 bugs to make this house generate an unlimited number of beetles.",
    bugType: "beetle",
  };
}

export function greenflyHouseDialogue(): Dialogue {
  return {
    id: "greenflyHouse",
    text: "This is the greenfly house. Drop all the greenflies here.",
    bugType: "ant",
  };
}

export function buildWorkshopDialogue(beetleId: string): Dialogue {
  return {
    id: "buildWorkshop",
    text: "Wow, that's a very nice house. All the beetles that come from the hole will stay here. Let's build a workshop so we can craft tools that will make our lives easier.",
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

export function firstStackDialogue(): Dialogue {
  return {
    id: "firstStack",
    text: "If you stack 10 or more items, it becomes an infinite source of that resource.",
    bugType: "beetle",
  };
}

export function buildWoodcutterDialogue(beetleId?: string): Dialogue {
  return {
    id: "buildWoodcutter",
    text: "Build a woodcutter and drop some sticks on it to create wood. If you need more beetles, try digging them out or taking one from the house.",
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
    text: "Great! With the wooden beams, we can build a stonemason and produce some bricks. You will need hammers and chisels for that purpose. You can find them in the workshop.",
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

export function buildKitchenDialogue(): Dialogue {
  return {
    id: "buildKitchen",
    text: "Hurray! We can now build a kitchen. Use one of the beetles to build it and check out the workshop for the required tools.",
    bugType: "beetle",
  };
}

export function cookingListDialogue(): Dialogue {
  return {
    id: "cookingList",
    text: "You can cook tasty meals here that will make other bugs visit our town. Some dishes are available only after upgrading the building.",
    bugType: "beetle",
    infographic: createElement(CookingListInfographic),
  };
}

export function buildTavernDialogue(): Dialogue {
  return {
    id: "buildTavern",
    text: "This kitchen will produce various types of food. Let's now build a tavern that will hopefully attract more bugs.",
    bugType: "beetle",
  };
}

export function tavernListDialogue(): Dialogue {
  return {
    id: "tavernList",
    text: "We can attract other bugs by serving their favorite food in this tavern.",
    bugType: "beetle",
    infographic: createElement(TavernListInfographic),
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
    text: "Hello there! What a nice little village you have here. I would love to see it become more prosperous. If you drop enough ants into the hole, we will turn it into an anthill.",
    bugType: "ant",
    infographic: createElement(UpgradeHoleInfographic),
  };
}

export function digMoreResourcesDialogue(anthillId: string): Dialogue {
  return {
    id: "digMoreResources",
    text: "Great! Thanks to our work, this land is more fertile now. We can also dig more resources from the hole.",
    bugType: "ant",
    cursorEntityId: anthillId,
  };
}

export function automateWithAntsDialogue(): Dialogue {
  return {
    id: "automateWithAnts",
    text: "The other ants and I can help you carry items if you want. Just drop us on a stack and we will deliver items to that stack automatically. To create stacks, you need to craft a rake in the workshop.",
    bugType: "ant",
    infographic: createElement(AutomateTransportInfographic),
  };
}

export function firstGreenflyDialogue(): Dialogue {
  return {
    id: "firstGreenfly",
    text: "Look! A greenfly! This is ladybugs' favorite food. Let's fatten it up and prepare it in the kitchen.",
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

export function smelterDialogue(): Dialogue {
  return {
    id: "smelter",
    text: "The smelter processes iron and clay. You will be able to process more items after upgrading the building.",
    bugType: "ant",
    infographic: createElement(ProcessIronInfographic),
  };
}

export function firstLadybugDialogue(ladybugId: string): Dialogue {
  return {
    id: "firstLadybug",
    text: "Mmm. That was yummy! Hey, guess what? I can upgrade buildings for you. They will craft better items. Let's start with the workshop.",
    bugType: "ladybug",
    cursorEntityId: ladybugId,
  };
}

export function buildFarmDialogue(): Dialogue {
  return {
    id: "buildFarm",
    text: "With this new set of handy tools, we should be able to turn our village into a beautiful small town. Let's upgrade more buildings and produce more items so we can construct a farm.",
    bugType: "ladybug",
  };
}

export function stonemasonUpgradedDialogue(): Dialogue {
  return {
    id: "stonemasonUpgraded",
    text: "You can now produce paving stones from stone bricks. Upgrade it further to make sculptures.",
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

export function buildMushroomFieldDialogue(farmId: string): Dialogue {
  return {
    id: "buildMushroomField",
    text: "Excellent! Thanks to this farm, we can produce our own types of food. Click on the farm and build a mushroom field.",
    bugType: "ladybug",
    cursorEntityId: farmId,
  };
}

export function mushroomFieldDialogue(): Dialogue {
  return {
    id: "mushroomField",
    text: "The mushrooms will grow on this field if you fertilize it with scraps of paper.",
    bugType: "ladybug",
    infographic: createElement(PaperToMushroomInfographic),
  };
}

export function firstMushroomDialogue(): Dialogue {
  return {
    id: "firstMushroom",
    text: "Ah, finally! The mushrooms are loved by termites. Let's attract some of them. You must upgrade the kitchen first in order to prepare mushroom sauce.",
    bugType: "ladybug",
  };
}

export function firstTermiteDialogue(): Dialogue {
  return {
    id: "firstTermite",
    text: "Good morning, sir! I've heard about this place and I've been eager to see it. This town is so lovely and there is so much work to be done here. Let me suggest that termites are much better at tunneling than ants. If we could... improve their anthill into a termite mound, we would be able to dig deeper, making this land more fertile. Just drop three of us into the anthill and that should do it.",
    bugType: "termite",
  };
}

export function termiteMoundDialogue(termiteMoundId: string): Dialogue {
  return {
    id: "termiteMound",
    text: "Fantastic! We will now dig up more valuable items.",
    bugType: "termite",
    cursorEntityId: termiteMoundId,
  };
}

export function automateWithTermitesDialogue(): Dialogue {
  return {
    id: "automateWithTermites",
    text: "We termites are excellent workers. You can put us in a building and we will automatically gather the resources required for production.",
    bugType: "termite",
    infographic: createElement(AutomateProductionInfographic),
  };
}

export function firstRottenAppleDialogue(): Dialogue {
  return {
    id: "firstRottenApple",
    text: "These rotten apples can be used in the composter at the farm to attract flies.",
    bugType: "termite",
  };
}

export function composterDialogue(): Dialogue {
  return {
    id: "composter",
    text: "Drop some rotten apples here. That should attract flies, which can then be prepared in the kitchen. Spiders can't resist them.",
    bugType: "termite",
    infographic: createElement(AppleToFlyInfographic),
  };
}

export function firstSpiderDialogue(): Dialogue {
  return {
    id: "firstSpider",
    text: "It's a pleasure to meet you. Spiders are very well-educated bugs and can work in administration buildings, like the library. Thanks to us, this town may actually construct a town hall and call itself a truly happy bug town. Start by upgrading the smelter and other buildings until you build the most important building: the town hall. Do you think you can do that?",
    bugType: "spider",
  };
}

export function libraryDialogue(): Dialogue {
  return {
    id: "library",
    text: "The library produces books out of paper. You can use them to supply the town hall.",
    bugType: "spider",
    infographic: createElement(PaperToBookInfographic),
  };
}

export function townHallDialogue(): Dialogue {
  return {
    id: "townHall",
    text: "That's amazing! This town hall is the true crowning achievement of our town's glory. Thanks to it, we can establish diplomatic relations with other colonies. A bee delegation might visit us if we make a good impression. We can welcome them with flowers.",
    bugType: "spider",
    infographic: createElement(FlowersToBeeInfographic),
  };
}

export function flowersFieldDialogue(): Dialogue {
  return {
    id: "flowersField",
    text: "Use seeds to plant flowers on this field.",
    bugType: "spider",
    infographic: createElement(SeedsToFlowersInfographic),
  };
}

export function firstBeeDialogue(): Dialogue {
  return {
    id: "firstBee",
    text: "Greetings, my friends! What a delightfully splendid town! Should you grant us your permission, we shall transform it into the most prosperous community in the realm. It is our desire to establish a hive here, which will greatly enhance the fertility of your soil. If this proposal pleases you, kindly place three bees within the termite mound.",
    bugType: "bee",
  };
}

export function beehiveDialogue(): Dialogue {
  return {
    id: "beehive",
    text: "Splendid! You have succeeded in establishing a truly wondrous settlement.",
    bugType: "bee",
  };
}

export function cannotBuildDialogue(reason: CannotBuildReason): Dialogue {
  switch (reason) {
    case "noSpace":
      return {
        id: "cannotBuild",
        text: "There's not enough space to build this. You can drop items back into the hole to make some room.",
        bugType: "beetle",
        infographic: createElement(StickToHoleInfographic),
      };
  }
}

export function cannotPlaceDialogue(): Dialogue {
  return {
    id: "cannotPlace",
    text: "There's not enough space to place an item. You can drop items back into the hole to make some room.",
    bugType: "beetle",
    infographic: createElement(StickToHoleInfographic),
  };
}

function isUpgradedAndPowered(structure: Structure): boolean {
  return getCompletedUpgradeLevel(structure) >= 1 && isStructurePowered(structure);
}

export function structureClickDialogue(structure: Structure): Dialogue | null {
  if (!isStructureBuilt(structure) || !isStructurePowered(structure)) {
    return null;
  }

  switch (structure.structureType) {
    case "beetle_house":
      return beetleHouseDialogue();
    case "greenfly_house":
      return greenflyHouseDialogue();
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
    case "mushrooms_field":
      return mushroomFieldDialogue();
    case "composter":
      return composterDialogue();
    case "library":
      return libraryDialogue();
    case "town_hall":
      return townHallDialogue();
    case "flowers_field":
      return flowersFieldDialogue();
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
        text: "Use this stick as a building material or a crafting resource.",
      };
    case "iron_ore":
      return firstIronOreDialogue();
    case "leaf_rake":
      return {
        id: "leaf_rake",
        text: "Thanks to the rake, you can stack light items: sticks, leaves, and roots.",
        bugType: "beetle",
        infographic: createElement(StackingItemsInfographic),
      };
    case "wheelbarrel":
      return {
        id: "wheelbarrel",
        text: "The wheelbarrel allows you to stack heavy items: rocks, iron ore, clay, glass, and gravel.",
        bugType: "ladybug",
      };
    case "clay":
      return {
        id: "clay",
        text: "Burn this clay in the smelter to produce roof tiles.",
        bugType: "ant",
      };
    case "glass":
      return {
        id: "glass",
        text: "Glass can serve as a building material.",
        bugType: "ant",
      };
    case "paper":
      return {
        id: "paper",
        text: "These scraps of paper may come in handy for agriculture or administration.",
        bugType: "ant",
      };
    case "rotten_apple":
      return firstRottenAppleDialogue();
    case "seeds":
      return {
        id: "seeds",
        text: "Plant these seeds on the flower field at the farm.",
        bugType: "termite",
      };
    case "gravel":
      return {
        id: "gravel",
        text: "Use this gravel to produce concrete at the smelter.",
        bugType: "termite",
      };
    case "axe":
      return {
        id: "axe",
        text: "This axe is required in the woodcutter.",
        bugType: "beetle",
      };
    case "hammer_and_chisel":
      return {
        id: "hammer_and_chisel",
        text: "The hammer and chisel are needed in the stonemason.",
        bugType: "beetle",
      };
    case "knife":
      return {
        id: "knife",
        text: "This knife is required to cook meals in the kitchen.",
        bugType: "beetle",
      };
    case "crucible":
      return {
        id: "crucible",
        text: "The crucible is essential for the smelter to work.",
        bugType: "ant",
      };
    case "hoe":
      return {
        id: "hoe",
        text: "The hoe is used at the farm to grow food.",
        bugType: "ladybug",
      };
    case "basket":
      return {
        id: "basket",
        text: "The basket makes it possible to stack scraps of paper, apples, and seeds.",
        bugType: "ladybug",
      };
    case "desk":
      return {
        id: "desk",
        text: "The desks are essential furnishings for the library.",
        bugType: "termite",
      };
    case "fountain":
      return {
        id: "fountain",
        text: "We need a fountain to construct the town hall.",
        bugType: "termite",
      };
    case "brick":
      return {
        id: "brick",
        text: "You can use bricks as a building material.",
        bugType: "beetle",
      };
    case "wood":
      return {
        id: "wood",
        text: "Use the wooden beams to construct buildings.",
        bugType: "beetle",
      };
    case "nettle_soup":
      return {
        id: "nettle_soup",
        text: "This nettle soup can attract ants to the tavern.",
        bugType: "beetle",
      };
    case "grilled_greenflies":
      return {
        id: "grilled_greenflies",
        text: "The grilled greenflies are a snack for ladybugs. You can serve them at the tavern.",
        bugType: "ant",
      };
    case "iron_ingot":
      return {
        id: "iron_ingot",
        text: "The forged iron can be used to construct more advanced buildings and tools.",
        bugType: "ant",
      };
    case "roof_tile":
      return {
        id: "roof_tile",
        text: "The clay roof tiles are used at construction sites.",
        bugType: "ant",
      };
    case "paving_stone":
      return {
        id: "paving_stone",
        text: "The paving stones can be used to raise more advanced buildings.",
        bugType: "ladybug",
      };
    case "plank":
      return {
        id: "plank",
        text: "The planks are needed to build more advanced buildings and tools.",
        bugType: "ladybug",
      };
    case "mushroom":
      return {
        id: "mushroom",
        text: "Cook this mushroom in the kitchen to attract termites.",
        bugType: "ladybug",
      };
    case "pasta":
      return {
        id: "pasta",
        text: "This delicious pasta with mushroom sauce will give termites a good reason to stay at our tavern.",
        bugType: "ladybug",
      };
    case "stuffed_fly":
      return {
        id: "stuffed_fly",
        text: "This fly dish can be served at the tavern to attract spiders.",
        bugType: "termite",
      };
    case "concrete":
      return {
        id: "concrete",
        text: "This is concrete, a professional building material.",
        bugType: "termite",
      };
    case "steel":
      return {
        id: "steel",
        text: "The steel beams are the best building material you can find.",
        bugType: "termite",
      };
    case "furniture":
      return {
        id: "furniture",
        text: "The furniture is needed for the town's most important buildings, such as the library or the town hall.",
        bugType: "termite",
      };
    case "sculpture":
      return {
        id: "sculpture",
        text: "Thanks to the sculptures, we can build decorated structures, such as the library and the fountains.",
        bugType: "termite",
      };
    case "book":
      return {
        id: "book",
        text: "The books are needed to supply the town hall.",
        bugType: "termite",
      };
    case "flower":
      return {
        id: "flower",
        text: "Use these flowers at the town hall to attract bees.",
        bugType: "termite",
      };
    default:
      return null;
  }
}

export function bugClickDialogue(bugType: BugType): Dialogue | null {
  switch (bugType) {
    case "ant":
      return automateWithAntsDialogue();
    case "termite":
      return automateWithTermitesDialogue();
    case "bee":
      return firstBeeDialogue();
    case "spider":
      return {
        id: "spider",
        text: "Hi, I am a spider, a highly educated arachnid that can work in administration buildings, like library or town hall.",
        bugType: "spider",
      };
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
        bugType: "termite",
      };
    default:
      return null;
  }
}
