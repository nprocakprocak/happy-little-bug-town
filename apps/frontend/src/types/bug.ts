import { BugType, ItemType, Position } from "@happy-little-bug-town/utils";

import { GridAnimatable, WithId } from "./gridEntity";

interface BugItem {
  id: string;
  itemType: ItemType;
}

export interface Bug extends WithId, Position, GridAnimatable {
  bugType: BugType;
  items: BugItem[];
}
