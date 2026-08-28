export type FarmBuildableStructureType =
  | "mushrooms_field"
  | "flowers_field"
  | "composter";

export type BuildableStructureType =
  | "beetle_house"
  | "greenfly_house"
  | "workshop"
  | "stonemason"
  | "woodcutter"
  | "kitchen"
  | "tavern"
  | "smelter"
  | "farm"
  | "library"
  | "town_hall"
  | FarmBuildableStructureType;

export type UpgradableStructureType =
  | "workshop"
  | "stonemason"
  | "woodcutter"
  | "kitchen"
  | "smelter";

export type StructureType =
  | "hole"
  | "anthill"
  | "termite_mound"
  | "beehive"
  | BuildableStructureType;
