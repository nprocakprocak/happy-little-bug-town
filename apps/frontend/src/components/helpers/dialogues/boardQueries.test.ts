import { BugType, ItemType, StructureType } from "@happy-little-bug-town/utils";
import { describe, expect, it } from "vitest";

import { Bug } from "../../../types/bug";
import { GridEntity } from "../../../types/gridEntity";
import { Item } from "../../../types/item";
import { Stack } from "../../../types/stack";
import { Structure } from "../../../types/structure";
import { findAnthillOnBoard } from "./findAnthillOnBoard";
import { findBeehiveOnBoard } from "./findBeehiveOnBoard";
import { findBrickOnBoard } from "./findBrickOnBoard";
import { findBuiltAxeOnBoard } from "./findBuiltAxeOnBoard";
import { findBuiltBeetleHouseOnBoard } from "./findBuiltBeetleHouseOnBoard";
import { findBuiltComposterOnBoard } from "./findBuiltComposterOnBoard";
import { findBuiltFarmOnBoard } from "./findBuiltFarmOnBoard";
import { findBuiltKitchenOnBoard } from "./findBuiltKitchenOnBoard";
import { findBuiltLibraryOnBoard } from "./findBuiltLibraryOnBoard";
import { findBuiltMushroomsFieldOnBoard } from "./findBuiltMushroomsFieldOnBoard";
import { findBuiltTavernOnBoard } from "./findBuiltTavernOnBoard";
import { findBuiltTownHallOnBoard } from "./findBuiltTownHallOnBoard";
import { findBuiltWoodcutterOnBoard } from "./findBuiltWoodcutterOnBoard";
import { findBuiltWorkshopOnBoard } from "./findBuiltWorkshopOnBoard";
import { findEmptyStructureBlueprintOnBoard } from "./findEmptyStructureBlueprintOnBoard";
import { findFedBeetleOnBoard } from "./findFedBeetleOnBoard";
import { findLadybugOnBoard } from "./findLadybugOnBoard";
import { findTermiteMoundOnBoard } from "./findTermiteMoundOnBoard";
import { findUpgradedStonemasonOnBoard } from "./findUpgradedStonemasonOnBoard";
import { findUpgradedWoodcutterOnBoard } from "./findUpgradedWoodcutterOnBoard";
import { findUpgradedWorkshopOnBoard } from "./findUpgradedWorkshopOnBoard";
import { findWoodOnBoard } from "./findWoodOnBoard";
import { hasAntOnBoard } from "./hasAntOnBoard";
import { hasBeeOnBoard } from "./hasBeeOnBoard";
import { hasClayOnBoard } from "./hasClayOnBoard";
import { hasGravelOnBoard } from "./hasGravelOnBoard";
import { hasGreenflyOnBoard } from "./hasGreenflyOnBoard";
import { hasIronOreOnBoard } from "./hasIronOreOnBoard";
import { hasLeafAndBeetleOnBoard } from "./hasLeafAndBeetleOnBoard";
import { hasMushroomOnBoard } from "./hasMushroomOnBoard";
import { hasRottenAppleOnBoard } from "./hasRottenAppleOnBoard";
import { hasSpiderOnBoard } from "./hasSpiderOnBoard";
import { hasStackOnBoard } from "./hasStackOnBoard";
import { hasTermiteOnBoard } from "./hasTermiteOnBoard";
import { isStartingBoardState } from "./isStartingBoardState";

function item(itemType: ItemType, ingredients: ItemType[] = []): Item {
  return {
    id: itemType,
    x: 1,
    y: 1,
    itemType,
    items: ingredients.map((ingredient, index) => ({
      id: `${itemType}-${index}`,
      itemType: ingredient,
    })),
  };
}

function bug(bugType: BugType, food: ItemType[] = []): Bug {
  return {
    id: bugType,
    x: 1,
    y: 1,
    bugType,
    items: food.map((itemType, index) => ({ id: `${bugType}-${index}`, itemType })),
  };
}

function stack(itemType: ItemType): Stack {
  return { id: `stack-${itemType}`, x: 1, y: 1, itemType, itemsCount: 2, bugs: [] };
}

let costId = 0;

function costs(entries: [ItemType, number][]): { id: string; itemType: ItemType }[] {
  return entries.flatMap(([itemType, count]) =>
    Array.from({ length: count }, () => {
      costId += 1;
      return { id: `cost-${costId}`, itemType };
    }),
  );
}

function structure(
  structureType: StructureType,
  itemCosts: [ItemType, number][],
  bugTypes: BugType[] = [],
  upgradeLevel = 0,
): Structure {
  return {
    id: structureType,
    x: 1,
    y: 1,
    structureType,
    upgradeLevel,
    items: costs(itemCosts),
    bugs: bugTypes.map((bugType, index) => ({
      id: `${structureType}-${bugType}-${index}`,
      bugType,
    })),
  };
}

describe("board dialogue queries", () => {
  const hole = structure("hole", []);
  const workshop = structure(
    "workshop",
    [
      ["leaf_part", 3],
      ["little_rock", 2],
      ["stick", 1],
      ["root", 1],
    ],
    ["beetle"],
  );
  const upgradedWorkshop = structure(
    "workshop",
    [
      ["leaf_part", 3],
      ["little_rock", 2],
      ["stick", 1],
      ["root", 1],
      ["wood", 1],
      ["brick", 1],
      ["iron_ingot", 1],
      ["glass", 1],
    ],
    ["ladybug"],
    1,
  );

  it("detects the starting hole and an empty blueprint", () => {
    expect(isStartingBoardState([hole])).toBe(true);
    expect(isStartingBoardState([])).toBe(false);
    expect(isStartingBoardState([hole, bug("ant")])).toBe(false);
    expect(isStartingBoardState([workshop])).toBe(false);
    expect(findEmptyStructureBlueprintOnBoard([structure("workshop", [])])?.id).toBe("workshop");
    expect(findEmptyStructureBlueprintOnBoard([workshop])).toBeUndefined();
    expect(findEmptyStructureBlueprintOnBoard([hole])).toBeUndefined();
  });

  it("finds bugs, items, and stacks by kind", () => {
    const fedBeetle = bug("beetle", ["leaf_part", "leaf_part"]);
    const entities: GridEntity[] = [
      fedBeetle,
      bug("ladybug"),
      bug("ant"),
      bug("bee"),
      bug("termite"),
      bug("spider"),
      bug("greenfly"),
      item("brick"),
      item("wood"),
      item("iron_ore"),
      item("gravel"),
      item("rotten_apple"),
      item("mushroom"),
      item("clay"),
      stack("leaf_part"),
      stack("clay"),
    ];

    expect(findFedBeetleOnBoard(entities)).toBe(fedBeetle);
    expect(findFedBeetleOnBoard([bug("beetle")])).toBeUndefined();
    expect(findLadybugOnBoard(entities)?.bugType).toBe("ladybug");
    expect(findBrickOnBoard(entities)?.itemType).toBe("brick");
    expect(findWoodOnBoard(entities)?.itemType).toBe("wood");
    expect(findBrickOnBoard([stack("brick")])).toBeUndefined();
    expect(hasAntOnBoard(entities)).toBe(true);
    expect(hasBeeOnBoard(entities)).toBe(true);
    expect(hasTermiteOnBoard(entities)).toBe(true);
    expect(hasSpiderOnBoard(entities)).toBe(true);
    expect(hasGreenflyOnBoard(entities)).toBe(true);
    expect(hasIronOreOnBoard(entities)).toBe(true);
    expect(hasGravelOnBoard(entities)).toBe(true);
    expect(hasRottenAppleOnBoard(entities)).toBe(true);
    expect(hasMushroomOnBoard(entities)).toBe(true);
    expect(hasClayOnBoard(entities)).toBe(true);
    expect(hasClayOnBoard([stack("clay")])).toBe(false);
    expect(hasStackOnBoard(entities)).toBe(true);
    expect(hasStackOnBoard([item("stick")])).toBe(false);
    expect(hasLeafAndBeetleOnBoard([stack("leaf_part"), fedBeetle])).toBe(true);
    expect(hasLeafAndBeetleOnBoard([item("leaf_part")])).toBe(false);
    expect(hasAntOnBoard([bug("beetle")])).toBe(false);
  });

  it("finds a crafted axe and ignores an unfinished one", () => {
    const axe = item("axe", ["little_rock", "stick", "root"]);

    expect(findBuiltAxeOnBoard([axe, item("axe")])).toBe(axe);
    expect(findBuiltAxeOnBoard([item("axe")])).toBeUndefined();
  });

  it("finds ground evolution structures", () => {
    expect(findAnthillOnBoard([structure("anthill", [])])?.structureType).toBe("anthill");
    expect(findTermiteMoundOnBoard([structure("termite_mound", [])])?.structureType).toBe(
      "termite_mound",
    );
    expect(findBeehiveOnBoard([structure("beehive", [])])?.structureType).toBe("beehive");
    expect(findAnthillOnBoard([hole])).toBeUndefined();
  });

  it("finds built and powered structures", () => {
    const tavern = structure(
      "tavern",
      [
        ["leaf_part", 3],
        ["brick", 1],
        ["wood", 1],
      ],
      ["beetle", "beetle"],
    );
    const kitchen = structure(
      "kitchen",
      [
        ["leaf_part", 2],
        ["brick", 1],
        ["wood", 2],
        ["knife", 2],
      ],
      ["beetle"],
    );
    const woodcutter = structure(
      "woodcutter",
      [
        ["leaf_part", 3],
        ["root", 1],
        ["stick", 2],
        ["little_rock", 1],
        ["axe", 2],
      ],
      ["beetle"],
    );
    const farm = structure(
      "farm",
      [
        ["plank", 1],
        ["paving_stone", 1],
        ["glass", 2],
        ["roof_tile", 2],
        ["hoe", 1],
      ],
      ["ladybug"],
    );
    const library = structure(
      "library",
      [
        ["concrete", 1],
        ["steel", 1],
        ["furniture", 2],
        ["sculpture", 2],
        ["desk", 2],
      ],
      ["spider", "spider"],
    );
    const townHall = structure(
      "town_hall",
      [
        ["concrete", 1],
        ["steel", 1],
        ["furniture", 2],
        ["fountain", 1],
        ["book", 3],
      ],
      ["spider", "spider"],
    );
    const composter = structure("composter", [
      ["clay", 2],
      ["rotten_apple", 2],
      ["leaf_part", 4],
    ]);
    const beetleHouse = structure("beetle_house", [
      ["leaf_part", 2],
      ["little_rock", 1],
      ["stick", 2],
    ]);
    const mushrooms = structure("mushrooms_field", [
      ["paper", 2],
      ["clay", 2],
      ["root", 2],
    ]);

    expect(findBuiltWorkshopOnBoard([hole, workshop])).toBe(workshop);
    expect(findBuiltWorkshopOnBoard([structure("workshop", [], ["beetle"])])).toBeUndefined();
    expect(findBuiltTavernOnBoard([tavern])).toBe(tavern);
    expect(findBuiltTavernOnBoard([{ ...tavern, bugs: tavern.bugs.slice(0, 1) }])).toBeUndefined();
    expect(findBuiltKitchenOnBoard([kitchen])).toBe(kitchen);
    expect(findBuiltWoodcutterOnBoard([woodcutter])).toBe(woodcutter);
    expect(findBuiltFarmOnBoard([farm])).toBe(farm);
    expect(findBuiltLibraryOnBoard([library])).toBe(library);
    expect(findBuiltTownHallOnBoard([townHall])).toBe(townHall);
    expect(findBuiltComposterOnBoard([composter])).toBe(composter);
    expect(findBuiltBeetleHouseOnBoard([beetleHouse])).toBe(beetleHouse);
    expect(findBuiltMushroomsFieldOnBoard([mushrooms])).toBe(mushrooms);
    expect(findBuiltKitchenOnBoard([workshop])).toBeUndefined();
  });

  it("finds a powered structure only after its upgrade is complete", () => {
    const stonemason = structure(
      "stonemason",
      [
        ["leaf_part", 2],
        ["little_rock", 2],
        ["root", 1],
        ["wood", 2],
        ["brick", 1],
        ["glass", 2],
        ["roof_tile", 1],
        ["hammer_and_chisel", 3],
      ],
      ["ladybug"],
      1,
    );
    const woodcutter = structure(
      "woodcutter",
      [
        ["leaf_part", 3],
        ["root", 1],
        ["stick", 2],
        ["little_rock", 1],
        ["wood", 1],
        ["paving_stone", 1],
        ["glass", 2],
        ["roof_tile", 1],
        ["axe", 3],
      ],
      ["ladybug"],
      1,
    );

    expect(findUpgradedWorkshopOnBoard([upgradedWorkshop])).toBe(upgradedWorkshop);
    expect(findUpgradedWorkshopOnBoard([workshop])).toBeUndefined();
    expect(findUpgradedStonemasonOnBoard([stonemason])).toBe(stonemason);
    expect(findUpgradedWoodcutterOnBoard([woodcutter])).toBe(woodcutter);
    expect(findUpgradedStonemasonOnBoard([{ ...stonemason, bugs: [] }])).toBeUndefined();
  });
});
