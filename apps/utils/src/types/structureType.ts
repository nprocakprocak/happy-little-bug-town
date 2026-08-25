export type FarmBuildableStructureType = "mushrooms_field";

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
  | FarmBuildableStructureType;

export type UpgradableStructureType = "stonemason" | "woodcutter" | "kitchen";

export type StructureType = "hole" | "anthill" | "termite_mound" | BuildableStructureType;
