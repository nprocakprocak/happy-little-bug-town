export type WorkshopItemType =
  | "axe"
  | "hammer_and_chisel"
  | "leaf_rake"
  | "shovel"
  | "knife"
  | "crucible"
  | "wheelbarrel"
  | "plow"
  | "basket"
  | "desk"
  | "fountain";

type DiggableItemType =
  | "leaf_part"
  | "little_rock"
  | "root"
  | "stick"
  | "iron_ore"
  | "clay"
  | "glass"
  | "paper"
  | "rotten_apple"
  | "seeds"
  | "gravel";

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
  | "pasta"
  | "stuffed_fly"
  | "concrete"
  | "steel"
  | "furniture"
  | "sculpture"
  | "book";

export type ItemType = DiggableItemType | CraftableItemType | WorkshopItemType;
