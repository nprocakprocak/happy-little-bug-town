export type WorkshopItemType =
  | "axe"
  | "hammer_and_chisel"
  | "leaf_rake"
  | "shovel"
  | "knife"
  | "crucible"
  | "wheelbarrel"
  | "plow";

type DiggableItemType =
  | "leaf_part"
  | "little_rock"
  | "root"
  | "stick"
  | "iron_ore"
  | "clay"
  | "greenfly"
  | "glass"
  | "paper"
  | "rotten_apple";

type CraftableItemType =
  | "brick"
  | "wood"
  | "nettle_soup"
  | "grilled_greenflies"
  | "iron_ingot"
  | "roof_tile"
  | "paving_stone"
  | "plank"
  | "mushroom"
  | "pasta";

export type ItemType = DiggableItemType | CraftableItemType | WorkshopItemType;
