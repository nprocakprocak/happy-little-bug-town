import { ItemType } from "@happy-little-bug-town/utils";

export interface WorkshopItemOption {
  id: string;
  itemType: ItemType;
}

const WORKSHOP_ITEM_TYPES: ItemType[] = [
  "axe",
  "hammer_and_chisel",
  "knife",
  "leaf_rake",
  "shovel",
];

export const WORKSHOP_ITEM_OPTIONS: WorkshopItemOption[] = WORKSHOP_ITEM_TYPES.map((itemType) => ({
  id: `workshop-item-option-${itemType}`,
  itemType,
}));
