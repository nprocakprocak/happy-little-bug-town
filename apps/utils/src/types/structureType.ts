export type FarmBuildableStructureType = "mushrooms_field" | "composter";

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

export type UpgradableStructureType = "stonemason" | "woodcutter" | "kitchen" | "smelter";

export type StructureType = "hole" | "anthill" | "termite_mound" | BuildableStructureType;
