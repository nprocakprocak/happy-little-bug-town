import { ItemType } from "@happy-little-bug-town/utils";

import { Dialogue } from "../types/dialogue";

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

export function flyDialogue(): Dialogue {
  return {
    id: "fly",
    text: "Put the fly in the kitchen to prepare a special meal for spiders.",
    bugType: "beetle",
  };
}

export function holeDialogue(cursorEntityId: string): Dialogue {
  return {
    id: "hole",
    text: "Look! It's a hole in the ground. Click it to dig.",
    cursorEntityId,
  };
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
