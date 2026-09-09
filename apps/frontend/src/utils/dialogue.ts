import { createElement } from "react";
import {
  BugType,
  getBugFoodCount,
  getBugFoodRequirement,
  isBugFed,
  ItemType,
  StructureType,
} from "@happy-little-bug-town/utils";

import { BricksProductionInfographic } from "../components/dialogue/BricksProductionInfographic";
import { HungryBugInfographic } from "../components/dialogue/HungryBugInfographic";
import { LeafToBeetleInfographic } from "../components/dialogue/LeafToBeetleInfographic";
import { StickToHoleInfographic } from "../components/dialogue/StickToHoleInfographic";
import { WoodProductionInfographic } from "../components/dialogue/WoodProductionInfographic";
import { hasDialogueBust } from "../components/helpers/characterImages";
import { Bug } from "../types/bug";
import { CannotBuildReason, Dialogue } from "../types/dialogue";

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
      bugType: "beetle",
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

export function buildKitchenDialogue(): Dialogue {
  return {
    id: "buildKitchen",
    text: "Hurray! We can now build a kitchen. Check out the workshop for the required tools.",
    bugType: "beetle",
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

export function structureClickDialogue(structureType: StructureType): Dialogue | null {
  switch (structureType) {
    case "woodcutter":
      return woodProductionDialogue();
    case "stonemason":
      return bricksProductionDialogue();
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
    default:
      return null;
  }
}

export function bugClickDialogue(bugType: BugType): Dialogue | null {
  switch (bugType) {
    case "greenfly":
      return {
        id: "greenfly",
        text: "Greenflies are the favorite food of ladybugs. Cook them in the kitchen.",
        bugType: "beetle",
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
