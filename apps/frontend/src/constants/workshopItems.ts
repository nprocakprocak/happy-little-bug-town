import { WORKSHOP_ITEM_TYPES, WorkshopItemType } from "@happy-little-bug-town/utils";

export interface WorkshopItemOption {
  id: string;
  itemType: WorkshopItemType;
}

export const WORKSHOP_ITEM_OPTIONS: WorkshopItemOption[] = WORKSHOP_ITEM_TYPES.map((itemType) => ({
  id: `workshop-item-option-${itemType}`,
  itemType,
}));
