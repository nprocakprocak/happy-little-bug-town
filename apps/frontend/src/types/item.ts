import { ItemType, Position } from "@happy-little-bug-town/utils";

import { GridAnimatable, WithId } from "./gridEntity";

interface ItemCraftItem {
  id: string;
  itemType: ItemType;
}

export interface Item extends WithId, Position, GridAnimatable {
  itemType: ItemType;
  items: ItemCraftItem[];
}
